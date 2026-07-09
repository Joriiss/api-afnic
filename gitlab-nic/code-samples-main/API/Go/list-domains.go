/* Retrieves the list of your domains. WARNING: it will find only the
 first N (N being curerntly 20, by default). See
 list-domains-paginated.go to get the entire list. */

	package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	request, err := http.NewRequest(http.MethodGet, "https://api-sandbox.nic.fr/v1/domains", nil)
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
		panic(fmt.Sprintf("Wrong HTTP response for list of domains: %s", response2.Status))
	}
	body, err := ioutil.ReadAll(response2.Body)
	if err != nil {
		panic(err)
	}
	type Domains struct {
		Name string /* We ignore the other members */
	}
	type Result struct {
		Content []Domains /* We ignore the other members */
	}
	var result Result
	err = json.Unmarshal(body, &result)
	if err != nil {
		panic(err)
	}
	for _, domain := range result.Content {
		fmt.Printf("%s\n", domain.Name)
	}
}
