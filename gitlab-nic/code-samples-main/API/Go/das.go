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
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	type ErrorInfo struct {
		ErrorCode     string
		RejectedValue string
		Message       string
	}
	type Error struct {
		Errors []ErrorInfo
	}
	if response2.StatusCode != 200 {
		var error Error
		err = json.Unmarshal(body, &error)
		details := ""
		if err != nil {
			details = fmt.Sprintf(" (because \"%s\")", body)
		} else {
			details = fmt.Sprintf(" (domain %s rejected because %s)", error.Errors[0].RejectedValue, error.Errors[0].Message)
		}
		panic(fmt.Sprintf("Wrong HTTP response for check of domains: %s%s", response2.Status, details))
	}
	type DomainAvailability struct {
		Name      string
		Available bool
		Reason    string /* Not present if the domain is available */
	}
	type ExtraDomainAvailability struct {
		Name      string
		Forbidden bool
		Reserved  bool
		Reason    string
	}
	type ExtraResponse struct {
		Response []ExtraDomainAvailability
	}
	type Extension struct {
		Frnic ExtraResponse
	}
	type Response struct {
		Response   []DomainAvailability
		Extensions Extension
	}
	var response Response
	err = json.Unmarshal(body, &response)
	if err != nil {
		panic(err)
	}
	domains := make(map[string]ExtraDomainAvailability)
	for _, domain := range response.Extensions.Frnic.Response {
		domains[domain.Name] = domain
	}
	for _, domain := range response.Response {
		var avail string
		if domain.Available {
			if domains[domain.Name].Forbidden {
				avail = "forbidden"
			} else if domains[domain.Name].Reserved {
				avail = fmt.Sprintf("available but special handling %s", domains[domain.Name].Reason)
			} else {
				avail = "available"
			}
		} else {
			avail = fmt.Sprintf("NOT available (%s)", domain.Reason)
		}
		fmt.Printf("%s: %s\n", domain.Name, avail)
	}
}
