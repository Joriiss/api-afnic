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
	const contact = "CTC65093"
	type Contact struct {
		ClientID string `json:"clientId"`
		Role     string `json:"role"`
	}
	type Request struct {
		Name       string    `json:"name"`
		AuthInfo   string    `json:"authorizationInformation"`
		Registrant string    `json:"registrantClientId"`
		Contacts   []Contact ` json:"contacts"`
	}
	var my_request Request
	flag.Parse()
	if flag.NArg() != 1 {
		panic("Usage: create-domain domainname ...")
	}
	my_request.Name = flag.Arg(0)
	my_request.AuthInfo = "Vachement1234sur"
	my_request.Registrant = contact
	my_request.Contacts = make([]Contact, 2)
	my_request.Contacts[0].ClientID = contact
	my_request.Contacts[0].Role = "ADMINISTRATIVE"
	my_request.Contacts[1].ClientID = contact
	my_request.Contacts[1].Role = "TECHNICAL"
	json_list, err := json.Marshal(my_request)
	if err != nil {
		panic(err)
	}
	request, err := http.NewRequest(http.MethodPost,
		"https://api-sandbox.nic.fr/v1/domains",
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
	if response2.StatusCode != 201 {
		panic(fmt.Sprintf("Wrong HTTP response for create of domain: %s", response2.Status))
	}
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	type DomainCreation struct {
		Name         string
		CreationDate string
	}
	var response DomainCreation
	err = json.Unmarshal(body, &response)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%s created on %s\n", response.Name, response.CreationDate)
}
