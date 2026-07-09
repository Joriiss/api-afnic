#!/usr/bin/env perl

use strict;
use warnings;

use JSON;

use lib 'lib';
use Afnic::API qw( init domain_get_info);

sub domain_info {
    init();
    my $content = domain_get_info(@_);
    print( encode_json( $content ) . "\n" );
}

domain_info( @ARGV );
