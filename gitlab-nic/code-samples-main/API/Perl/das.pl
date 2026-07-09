#!/usr/bin/env perl

use strict;
use warnings;

use JSON;

use lib 'lib';
use Afnic::API qw( init check_das );

sub das {
    init();
    my ( $content ) = check_das( @_ );

    my %status = ();
    for my $ans ( @{ $content->{response} } ) {
        $status{$ans->{name}} = {};
        $status{$ans->{name}}->{available} = $ans->{available};
        $status{$ans->{name}}->{reason} = $ans->{reason} if $ans->{reason};
    }

    # output in the same order as the command line order
    for my $name (@_) {
        my $available = ( $status{$name}->{available} ? "" : "NOT " ) . "available";
        my $reason = $status{$name}->{reason} ? " ($status{$name}->{reason})" : "";
        print( "$name: " . $available . "$reason\n");
    }
}

das( @ARGV );
