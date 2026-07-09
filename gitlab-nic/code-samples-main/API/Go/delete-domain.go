package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	flag.Parse()
	if flag.NArg() != 1 {
		panic("Usage: delete-domain domainname ...")
	}
	domainname := flag.Arg(0)
	request, err := http.NewRequest(http.MethodDelete,
		fmt.Sprintf("https://api-sandbox.nic.fr/v1/domains/%s", domainname),
		nil)
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
		panic(fmt.Sprintf("Wrong HTTP response for delete of domain: %s", response2.Status))
	}
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	type DomainDeletion struct {
		Name string
	}
	var response DomainDeletion
	err = json.Unmarshal(body, &response)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%s deleted\n", response.Name)
}
