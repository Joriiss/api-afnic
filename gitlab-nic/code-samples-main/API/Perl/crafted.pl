#!/usr/bin/env perl

use strict;
use warnings;

use JSON;

use lib 'lib';
use Afnic::API qw( $API_ENDPOINT init send_and_retry );

sub send_crafted {
    init();

    my $endpoint = $API_ENDPOINT . "domains/transfers?page=0";

    my ( $content, $response ) = send_and_retry( 'GET', $endpoint );

    my $http_code = $response->code();
    print( "http code: $http_code\n" );

    my $total = $content->{totalElements};
    my $domains = $content->{content};

    print( join("\n", map( $_->{name}, @$domains ) ) . "\n");

    print( "nbr: " . @$domains . "\n" );
    print( "total: $total\n" );
}

send_crafted();
