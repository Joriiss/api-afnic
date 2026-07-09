#!/usr/bin/env perl

use strict;
use warnings;

use JSON;

use lib 'lib';
use Afnic::API qw( init domains_list );

sub domain_info {
    init();
    my $list = domains_list(@_);
    print( join("\n", @$list ) . "\n" );
}

domain_info( @ARGV );
