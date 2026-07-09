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
	type Domains struct {
		Name string /* We ignore the other members */
	}
	type List_result struct {
		Content []Domains /* We ignore the other members */
	}
	var list_result List_result
	type DomainStatus struct {
		Name       string
		UpdateDate string
	}
	var patch_response DomainStatus
	type Patch_request struct {
		Name       string   `json:"name"`
		NameServer []string `json:"nameServersToAdd"`
	}
	var my_request Patch_request
	flag.Parse()
	if flag.NArg() != 1 {
		panic("Usage: add-nameserver-to-all hostname")
	}
	ns := flag.Arg(0)
	headers := headers()
	request, err := http.NewRequest(http.MethodGet, "https://api-sandbox.nic.fr/v1/domains", nil)
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
		panic(fmt.Sprintf("Wrong HTTP response for list of domains: %s", response2.Status))
	}
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal(body, &list_result)
	if err != nil {
		panic(err)
	}
	for _, domain := range list_result.Content {
		my_request.NameServer = make([]string, 1)
		my_request.NameServer[0] = ns
		my_request.Name = domain.Name
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
		err = json.Unmarshal(body, &patch_response)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%s updated on %s\n", patch_response.Name, patch_response.UpdateDate)
	}
}
