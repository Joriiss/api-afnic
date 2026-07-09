/* Delete a DNSSEC key. 

Example of use:
./delete-dnskey café.fr 52726 RSASHA256 SHA256 91E907DB04319EAE1BAF14CE3006D94C4C94618BC4BF4CD7FA36DCF15B8AA8C9

*/

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
)

func main() {
	type Keys struct {
		KeyTag     int    `json:"keyTag"`
		Algorithm  string `json:"algorithm"`
		DigestType string `json:"digestType"`
		Digest     string `json:"digest"`
	}
	type DnsSecActions struct {
		KeysToRemove []Keys `json:"keysToRemove,omitempty"`
		KeysToAdd    []Keys `json:"keysToAdd,omitempty"`
	}
	type PossibleExtensions struct {
		Dnssec DnsSecActions `json:"dnsSec,omitempty"`
	}
	type Request struct {
		Name       string             `json:"name"`
		Extensions PossibleExtensions `json:"extensions"`
	}
	var my_request Request
	headers := headers()
	flag.Parse()
	if flag.NArg() != 5 {
		panic("Usage: delete-dnskey domain tag algorithm digest-type digest")
	}
	domain := flag.Arg(0)
	my_request.Name = domain
	tag, err := strconv.Atoi(flag.Arg(1))
	if err != nil {
		panic(fmt.Sprintf("Invalid key tag \"%s\": %s", flag.Arg(1), err))
	}
	my_request.Extensions.Dnssec.KeysToRemove = make([]Keys, 1)
	my_request.Extensions.Dnssec.KeysToRemove[0].KeyTag = tag
	my_request.Extensions.Dnssec.KeysToRemove[0].Algorithm = flag.Arg(2)
	my_request.Extensions.Dnssec.KeysToRemove[0].DigestType = flag.Arg(3)
	my_request.Extensions.Dnssec.KeysToRemove[0].Digest = flag.Arg(4)
	json_list, err := json.Marshal(my_request)
	if err != nil {
		panic(err)
	}
	json_b := bytes.NewReader(json_list)
	request, err := http.NewRequest(http.MethodPatch,
		"https://api-sandbox.nic.fr/v1/domains/",
		json_b)
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
	type ErrorInfo struct {
		ErrorCode     string
		RejectedValue string
		Message       string
	}
	type Error struct {
		Errors []ErrorInfo
	}
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	if response2.StatusCode != 200 {
		var error Error
		err = json.Unmarshal(body, &error)
		fmt.Fprintf(os.Stderr, "Wrong HTTP response for update of domain %s: %s (%s)\n", my_request.Name, response2.Status, error)
		os.Exit(1)
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
