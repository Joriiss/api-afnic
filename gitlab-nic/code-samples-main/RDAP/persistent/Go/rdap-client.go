/* RDAP requests on a persistent connection. We retrieve and display
the statuses of several domain names, using just one RDAP
connection.

Hardwired for the .re TLD. TODO: retrieve and parse the IANA database
of RDAP servers.

*/

package main

import (
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	/* We are interested only in the status. All other fields of
	the RDAP JSON response are ignored. */
	type Response struct {
		Handle string
		Status []string
	}
	var response_json Response
	var disablePersistence bool
	var kl io.Writer = nil
	var err error
	flag.BoolVar(&disablePersistence, "no-reuse", false, "Disable HTTP persistence (keep-alives, or reuse of connections)")
	flag.Parse()
	if flag.NArg() <= 0 {
		panic("Usage: rdap-client domainname.re ...")
	}
	keylogfile := os.Getenv("SSLKEYLOGFILE") /* Too bad that Go's standard library does not do it automatically :-(
	   https://www.benburwell.com/posts/intercepting-golang-tls-with-wireshark/ */
	if keylogfile == "" {
		/* No log */
	} else { /* Warning, only the keys of the *last* connection will be logged */
		kl, err = os.OpenFile(keylogfile, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
		if err != nil {
			panic(err)
		}
	}
	/* Go handle persistent connections by default. See
	https://pkg.go.dev/net/http#hdr-Clients_and_Transports. We
	declare a transport just for the ability to disable
	persistence. Otherwise, we could as well have called
	http.Get(). */
	tr := &http.Transport{
		DisableKeepAlives: disablePersistence, /* The Go team choosed
		   a misnomer for this option... */
		TLSClientConfig: &tls.Config{KeyLogWriter: kl},
	}
	c := &http.Client{
		Transport: tr,
	}
	for i := 0; i < flag.NArg(); i++ {
		name := flag.Arg(i)
		response, err := c.Get(fmt.Sprintf("https://rdap.nic.re/domain/%s", name))
		if err != nil {
			panic(err)
		}
		if response.StatusCode != 200 {
			panic(fmt.Sprintf("Wrong HTTP response for getting info on domain %s: %s", name,
				response.Status))
		}
		body, err := ioutil.ReadAll(response.Body)
		if err != nil {
			panic(err)
		}
		/* response.Body.Close() Unecessary, at least when using TLS, but cleaner? */
		err = json.Unmarshal(body, &response_json)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%s (%s): %s\n", name, response_json.Handle, response_json.Status)
	}
}
