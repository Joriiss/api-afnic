/* DAS (Domain Availability Service) */

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	type Request struct {
		Names []string `json:"names"`
	}
	var list Request
	flag.Parse()
	if flag.NArg() <= 0 {
		panic("Usage: das domainname ...")
	}
	list.Names = make([]string, flag.NArg())
	for i := 0; i < flag.NArg(); i++ {
		list.Names[i] = flag.Arg(i)
	}
	json_list, err := json.Marshal(list)
	if err != nil {
		panic(err)
	}
	request, err := http.NewRequest(http.MethodPost,
		"https://api-sandbox.nic.fr/v1/domains/check",
		bytes.NewReader(json_list))
	if err != nil {
		panic(err)
	}
	for name, value := range headers() {
		request.Header.Add(name, value)
	}
	response2, err := http.DefaultClient.Do(request)
	if err != nil {
		panic(err)
	}
	if response2.StatusCode != 200 {
		panic(fmt.Sprintf("Wrong HTTP response for check of domains: %s", response2.Status))
	}
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	type DomainAvailability struct {
		Name      string
		Available bool
		Reason    string /* Not present if the domain is available */
	}
	type Response struct {
		Response []DomainAvailability
	}
	var response Response
	err = json.Unmarshal(body, &response)
	if err != nil {
		panic(err)
	}
	for _, domain := range response.Response {
		var avail string
		if domain.Available {
			avail = "available"
		} else {
			avail = fmt.Sprintf("NOT available (%s)", domain.Reason)
		}
		fmt.Printf("%s: %s\n", domain.Name, avail)
	}
}
