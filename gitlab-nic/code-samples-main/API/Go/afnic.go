package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
)

func headers() map[string]string {
	filename := os.Getenv("HOME") + "/.afnic-api"
	file, err := os.Open(filename)
	if err != nil {
		panic(err)
	}
	rd := bufio.NewReader(file)
	login, err := rd.ReadString('\n')
	if err != nil {
		panic(err)
	}
	login = login[:len(login)-1]
	password, err := rd.ReadString('\n')
	if err != nil {
		panic(err)
	}
	password = password[:len(password)-1]
	values := url.Values{"client_id": {"registrars-api-client"},
		"username": {login}, "password": {password},
		"grant_type": {"password"}}
	response, err := http.PostForm("https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token",
		values)
	if err != nil {
		panic(err)
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		panic(fmt.Sprintf("Wrong HTTP response for token: %s", response.Status))
	}
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		panic(err)
	}
	type Result struct {
		Access_token string /* We ignore the other members */
	}
	var result Result
	err = json.Unmarshal(body, &result)
	if err != nil {
		panic(err)
	}
	return map[string]string{"Content-Type": "application/json",
		"Accept": "application/json",
		"Extensions": "FRNIC_V2, SECDNS_V1_1",
		"Authorization": fmt.Sprintf("Bearer %s", result.Access_token)}
}
