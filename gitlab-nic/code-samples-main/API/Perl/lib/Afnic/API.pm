package Afnic::API;

use strict;
use warnings;

use JSON;
use Carp;
use Encode;
use LWP::UserAgent;
use Exporter 'import';

=head1 NAME

Afnic::API - a Perl module to play with the new public API from Afnic.

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

our @EXPORT = qw(
    $API_ENDPOINT
    load_auth_file
    init
    read_token
    write_token
    get_token
    send_and_retry
    domain_get_info
    domains_list
    check_das
);

our $API_ENDPOINT = "https://api-sandbox.nic.fr/v1/";
our $OAUTH_ENDPOINT = "https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token";

my $MAX_TRY = 5;

my %config = (
    username => undef,
    password => undef,
    token    => undef
);

my $AUTH_FILE = $ENV{HOME} . "/.afnic-api";
my $TOKEN_PATH = $ENV{HOME} . "/.afnic-api-token";

sub load_auth_file {
    open my $fh, '<', $AUTH_FILE or croak( "Unable to load authentication file: $AUTH_FILE" );
    my $username = <$fh>;
    my $password = <$fh>;
    close $fh;
    chop $username;
    chop $password;
    return ( $username, $password );
}

sub init {
    my ( $username, $password );

    eval {
        ( $username, $password ) = load_auth_file();
    };
    if ($@) {
        $username //= $ENV{API_USERNAME};
        $password //= $ENV{API_PASSWORD};
    }

    if ( not $username or not $password ) {
        croak( "Empty credential. Set $AUTH_FILE, or set environment \$API_USERNAME and \$API_PASSWORD" );
    }

    $config{username} = $username;
    $config{password} = $password;

    my $token = undef;
    if ( -e $TOKEN_PATH ) {
        $config{token} = read_token( $TOKEN_PATH );
    } else {
        $config{token} = get_token( $username, $password );
        write_token( $config{token}, $TOKEN_PATH );
    }
}

sub get_content {
    my ( $response ) = @_;
    if ( $response->content ) {
        return decode_json( $response->content );
    }
    return $response->content;
}

sub error {
    my ( $response ) = @_;
    my $http_code = $response->code;
    my $content = get_content( $response );
    return "An error occurred: ($http_code) " . encode_json( $content );
}

sub is_invalid_token {
    my ( $response ) = @_;
    my $content = get_content( $response );
    return ( $content and $content->{error} and $content->{error} eq 'invalid_token' );
}

sub write_token {
    my ( $token, $filepath ) = @_;
    open my $fh, '>', $filepath;
    print $fh $token;
    close $fh;
}

sub read_token {
    my ( $filepath ) = @_;
    open my $fh, '<', $filepath;
    my $token = <$fh>;
    close $fh;
    $config{token} = $token;
    return $token;
}

sub get_token {
    my ( $username, $password ) = @_;

    my $data = {
        'client_id'  => 'registrars-api-client',
        'username'   => $username,
        'password'   => $password,
        'grant_type' => 'password'
    };

    my $agent = LWP::UserAgent->new;
    my $response = $agent->post( $OAUTH_ENDPOINT, $data );

    if ( $response->is_error() ) {
        croak( error( $response ) );
    }

    my $content = get_content( $response );
    my $token = $content->{access_token};
    $config{token} = $token;
}

sub renew_token {
    my ( $try ) = @_;

    if ( $try >= $MAX_TRY ) {
        croak "Error: invalid token, could not renew token after $MAX_TRY attempts.";
    }
    get_token( $config{username}, $config{password} );
}

sub send_rest {
    my ( $method, $endpoint, $data ) = @_;

    my $agent = LWP::UserAgent->new;
    my $req   = HTTP::Request->new( uc( $method ) => $endpoint );

    $req->header( 'Extensions'    => 'FRNIC_V2' );
    $req->header( 'Authorization' => "Bearer $config{token}" ) if $config{token};
    $req->header( 'Content-Type'  => 'application/json' ) if $data;

    $req->content( encode_json( $data ) ) if $data;

    my $response = $agent->request( $req );

    return $response;
}

sub send_and_retry {
    my ( $method, $endpoint, $data, $try ) = @_;

    $try //= 0;

    my $response = send_rest( $method, $endpoint, $data, $try );

    if ( $response->is_error ) {
        if ( is_invalid_token( $response ) ) {
            renew_token( $try );
            return ( send_and_retry( $method, $endpoint, $data, $try + 1 ) );
        }
        croak( error( $response ) );
    }

    my $content = get_content( $response );
    return ( $content, $response );
}

sub domain_get_info {
    my ( $domain ) = @_;
    my $endpoint = $API_ENDPOINT . "domains/$domain";
    my ( $content ) = send_and_retry( 'GET', $endpoint );
    return $content;
}

sub domains_per_page {
    my ( $page, $sort_direction, $sort_attribute ) = @_;

    my @params = ();
    push( @params, "page=$page" ) if ( defined $page );
    push( @params, "sortDirection=$sort_direction" ) if ( defined $sort_direction );
    push( @params, "sortAttribute=$sort_attribute" ) if ( defined $sort_attribute );

    my $endpoint = $API_ENDPOINT . "domains";
    $endpoint .= "?" . join( "&", @params ) if ( scalar @params );

    my ( $content ) = send_and_retry( 'GET', $endpoint );

    return $content->{content};
}

sub domains {
    my @domains;
    my $page = 0;
    my $page_results;

    do {
        $page_results = domains_per_page( $page, 'ASC', 'NAME' );
        push @domains, @$page_results;
        $page++;
    } while ( @$page_results );

    return \@domains;
}

sub domains_list {
    my $domains = domains();
    my @list_domains = map( encode_utf8($_->{name}), @$domains );
    return \@list_domains;
}

sub check_das {
    my ( @domains ) = @_;
    my $endpoint = $API_ENDPOINT . "domains/check";
    my $data = {
        'names' => \@domains
    };
    my ( $content ) = send_and_retry( 'POST', $endpoint, $data );
    return $content;
}

1;
