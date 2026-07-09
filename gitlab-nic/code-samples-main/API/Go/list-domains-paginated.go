/* Retrieves the list of your domains. */

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

const page_size = 5 /* The maximum value. Over 100, you'll get a 400
   /* HTTP error. */

func main() {
	got_all := false
	domains := 0
	page := 0
	for !got_all {
		url := fmt.Sprintf("https://api-sandbox.nic.fr/v1/domains?pageSize=%d&page=%d", page_size, page)
		request, err := http.NewRequest(http.MethodGet,
			url,
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
			Content       []Domains
			TotalElements int `json:"totalElements"`
			/* We ignore the other members */
		}
		var result Result
		err = json.Unmarshal(body, &result)
		if err != nil {
			panic(err)
		}
		if len(result.Content) == 0 {
			break
		}
		for _, domain := range result.Content {
			domains += 1
			fmt.Printf("%s\n", domain.Name)
		}
		if domains >= result.TotalElements {
			got_all = true
			break
		} else {
			page += 1
		}
	}
	fmt.Printf("%d domains retrieved\n", domains)
}
