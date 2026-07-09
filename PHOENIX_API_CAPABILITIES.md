# Core Registry Services REST API (Phoenix API) — Capabilities

This document explains what the API can do, based on your local OpenAPI definition in `api-doc.yml` and the online Phoenix API docs at [api-sandbox.nic.fr/api-docs](https://api-sandbox.nic.fr/api-docs/).

## What this API is for

The **Core Registry Services REST API** provides the operations needed to **manipulate EPP objects in `.fr`** (domains, contacts, and hosts), plus operational features around:

- domain transfers/renewals and request processing
- authorization-code requests
- batch operations on domains
- exports and export metadata
- polling a processing queue
- registry-lock management and registry policy retrieval
- IP whitelisting
- file download from server-side object storage

## Base URL

`https://api-sandbox.nic.fr`

## Authentication

The OpenAPI spec declares a single security scheme:

- `keycloak` — `oauth2`

The operations themselves document `security: [ { keycloak: [] } ]` under each endpoint.

## Common headers

- `CLIENT_REQUEST_ID` (header, optional): request identifier you can set for traceability.
- `extensions` (header, optional): enables additional `.fr`-specific EPP extension behavior.
- `authInfo` (header, optional, type `string`): “Authorization information associated with the domain object”.

## EPP extensions (`extensions` header)

This API supports the following extension values via the `extensions` header:

- `SECDNS_V1_1`: manage DNSSEC (e.g., DNSSEC key material for domains)
- `FEE_V1`: manage fees (billing/fee-related operations for domain actions)
- `RGP_V1`: manage grace periods (notably used for restore operations)
- `FRNIC_V2`: `.fr`-specific data (reserved-name availability details, transfer-related needs, contact eligibility/reachability, etc.)

Notes from the spec: for some availability/check flows, the domain-check extension “can only use `FEE_V1` or `FRNIC_V2`”.

## Controller / Tag summary

The API groups operations into the following controllers (each maps to a set of endpoints):

- `domain-registrar-controller`: domain CRUD-like operations, transfers, renewals, history, exports
- `contact-registrar-controller`: contact CRUD-like operations and history
- `host-registrar-controller`: host CRUD-like operations, host availability check, exports, history
- `authorization-code-registrar-controller`: authorization-code request lifecycle and information
- `domain-batch-registrar-controller`: bulk domain operations (create/update/delete/renew/restore/transfer)
- `poll-registrar-controller`: polling and acknowledging queue messages
- `registry-lock-domain-registrar-controller`: list and relock registry locked domains
- `registry-lock-request-registrar-controller`: list and inspect registry lock requests
- `registry-policies-controller`: retrieve registry policy values
- `ip-whitelisting-registrar-controller`: IP allowlist management
- `export-controller`: export metadata retrieval
- `object-storage-controller`: file download by `uuid`

## Endpoint reference

### authorization-code-registrar-controller

**GET /v1/registrar/authorization-code-requests**
- Summary: List the authorization code requests
- operationId: `getAuthorizationCodeRequestList_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/registrar/authorization-code-requests**
- Summary: Request authorization code for a domain
- operationId: `create_22_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/registrar/authorization-code-requests/{repositoryObjectId}**
- Summary: Get information for authorization code request
- operationId: `info_41_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### contact-registrar-controller

**GET /v1/contacts**
- Summary: List registrar's sponsored contacts
- operationId: `getContacts_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**PATCH /v1/contacts**
- Summary: Update a contact
- operationId: `update_28_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/contacts**
- Summary: Create a contact
- operationId: `create_23_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**DELETE /v1/contacts/{clientId}**
- Summary: Delete a contact object
- operationId: `delete_18_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/contacts/{clientId}**
- Summary: Get information on a contact
- operationId: `info_42_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/contacts/{contactRoid}/operation-history**
- Summary: List operations processed on a contact
- operationId: `getContactHistoryOperations_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### domain-batch-registrar-controller

**POST /v1/domains/batch/delete**
- Summary: delete a list of Domain
- operationId: `domainBatchToDelete_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/batch/import**
- Summary: Create a list of Domain
- operationId: `domainBatchToCreate_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/batch/renew**
- Summary: renew a list of Domain
- operationId: `domainBatchToRenew_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/batch/restore**
- Summary: restore a list of Domain
- operationId: `domainBatchToRestore_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/batch/transfer**
- Summary: transfer a list of Domain
- operationId: `domainBatchToTransfer_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/batch/update**
- Summary: update a list of domain
- operationId: `domainBatchToUpdate_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### domain-registrar-controller

**GET /v1/domains**
- Summary: List registrar's sponsored domains
- operationId: `getDomains_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**PATCH /v1/domains**
- Summary: Update a domain (restore included)
- operationId: `update_19_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains**
- Summary: Create a Domain object
- operationId: `create_12_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/domains/associated-to-host/{hostName}**
- Summary: List domain associated to host
- operationId: `getDomainsAssociatedToHost_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/check**
- Summary: Check domain name's availability
- operationId: `check_3_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/exports**
- Summary: Export registrar's sponsored domains - same parameters of the domain list but in the request body
- operationId: `export_7_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/renew**
- Summary: Renew domain operations
- operationId: `renew_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/domains/transfers**
- Summary: List domain transfers
- operationId: `transferList_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/domains/transfers**
- Summary: Transfer domain operations
- operationId: `transfer_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**DELETE /v1/domains/{domainName}**
- Summary: Delete a domain object
- operationId: `delete_12_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/domains/{domainRoid}/operation-history**
- Summary: List operations processed on a domain
- operationId: `getDomainHistoryOperations_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/domains/{name}**
- Summary: Get information on a domain
- operationId: `info_25_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### export-controller

**GET /v1/exports**
- Summary: List exports information
- operationId: `getExportsMetadata_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### host-registrar-controller

**GET /v1/hosts**
- Summary: List registrar's sponsored hosts
- operationId: `getHosts_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**PATCH /v1/hosts**
- Summary: Update a host object
- operationId: `update_26_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/hosts**
- Summary: Create a host object
- operationId: `create_20_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/hosts/check**
- Summary: Check host names availability
- operationId: `check_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/hosts/export-associated-domain-names**
- Summary: Export associated domain from host
- operationId: `exportDomainsNames_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/hosts/exports**
- Summary: Export host list
- operationId: `export_9_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/hosts/{hostRoid}/operation-history**
- Summary: List operations processed on a host
- operationId: `getHostHistoryOperations_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**DELETE /v1/hosts/{name}**
- Summary: Delete a host object
- operationId: `delete_17_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/hosts/{name}**
- Summary: Get information on a host object
- operationId: `info_39_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### ip-whitelisting-registrar-controller

**GET /v1/registrar/crm/ip-whitelisting**
- Summary: List the IP addresses in IP whitelist
- operationId: `list_16_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**POST /v1/registrar/crm/ip-whitelisting**
- Summary: Add an IP address to IP whitelist
- operationId: `create_16_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**DELETE /v1/registrar/crm/ip-whitelisting/{version}/{ip}**
- Summary: Delete an IP from your whitelist
- operationId: `delete_15_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### object-storage-controller

**GET /v1/object-storage/download/{uuid}**
- Summary: Get file from server
- operationId: `downloadFile_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### poll-registrar-controller

**GET /v1/poll**
- Summary: Get the first message from the POLL
- operationId: `get_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/poll/count**
- Summary: Get the number of messages in POLL
- operationId: `getCount_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**DELETE /v1/poll/{id}**
- Summary: Acknowledge the first message from the POLL
- operationId: `ack_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### registry-lock-domain-registrar-controller

**GET /v1/registrar/registry-lock/domains**
- Summary: List registrar's registry locked domains
- operationId: `list_14_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**PATCH /v1/registrar/registry-lock/domains/{domainName}/relock**
- Summary: Relock unlocked temporary domain
- operationId: `relock_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### registry-lock-request-registrar-controller

**GET /v1/registrar/registry-lock/requests**
- Summary: List registrar's registry lock request
- operationId: `list_18_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

**GET /v1/registrar/registry-lock/requests/{repositoryObjectId}**
- Summary: Get information on a registry lock request
- operationId: `info_40_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

### registry-policies-controller

**GET /v1/policies**
- Summary: Retrieve registry policy values
- operationId: `getRegistryPolicies_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1`

