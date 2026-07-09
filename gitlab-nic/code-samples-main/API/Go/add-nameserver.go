package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	type Request struct {
		Name       string   `json:"name"`
		NameServer []string `json:"nameServersToAdd"`
	}
	var my_request Request
	headers := headers()
	flag.Parse()
	if flag.NArg() <= 1 {
		panic("Usage: add-nameserver hostname domain ...")
	}
	ns := flag.Arg(0)
	my_request.NameServer = make([]string, 1)
	my_request.NameServer[0] = ns
	for i := 1; i < flag.NArg(); i++ {
		my_request.Name = flag.Arg(i)
		json_list, err := json.Marshal(my_request)
		if err != nil {
			panic(err)
		}
		request, err := http.NewRequest(http.MethodPatch,
			"https://api-sandbox.nic.fr/v1/domains/",
			bytes.NewReader(json_list))
		if err != nil {
			panic(err)
		}
		for name, value := range headers {
			request.Header.Add(name, value)
		}
		response2, err := http.DefaultClient.Do(request)
		if err != nil {
			panic(err)
		}
		if response2.StatusCode != 200 {
			fmt.Fprintf(os.Stderr, "Wrong HTTP response for update of domain %s: %s\n", my_request.Name, response2.Status)
			continue
		}
		body, err := ioutil.ReadAll(response2.Body)
		if err != nil {
			panic(err)
		}
		type DomainStatus struct {
			Name       string
			UpdateDate string
		}
		var response DomainStatus
		err = json.Unmarshal(body, &response)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%s updated on %s\n", response.Name, response.UpdateDate)
	}
}
