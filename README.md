# Distributed Inference System (DevOps Internship Assignment)

This project deploys a distributed inference system using AWS and the iii quickstart project. The system is split across multiple virtual machines inside a private network and exposes model inference through a JSON HTTP API.

## Architecture

The system is deployed across two EC2 instances inside a custom VPC.

```text
                Internet
                    │
                    ▼
        ┌─────────────────────┐
        │ API VM (Public)     │
        │ Public Subnet       │
        │ iii HTTP API :3111  │
        │ caller-worker       │
        └─────────┬───────────┘
                  │ RPC over private subnet
                  ▼
        ┌─────────────────────┐
        │ Inference VM        │
        │ Private Subnet      │
        │ iii Engine :49134   │
        │ inference-worker    │
        │ Gemma 3 270M GGUF   │
        └─────────────────────┘

High-Level Flow
Client sends request to /v1/chat/completions
API VM receives request through iii-http
caller-worker forwards request via RPC
Inference worker executes model inference
Response is returned to API layer
Infrastructure

Provisioned using Terraform.

Components
Custom VPC
Public subnet (API VM)
Private subnet (Inference VM)
Internet Gateway
NAT Gateway
Route tables
Security Groups
2 EC2 instances
Terraform outputs
VM Design
API VM (Public Subnet)

Responsibilities:

Hosts HTTP API (127.0.0.1:3111)
Runs caller-worker
Accepts incoming traffic
Communicates with inference worker via private networking
Inference VM (Private Subnet)

Responsibilities:

Runs inference worker
Loads Gemma 3 270M GGUF model
Handles inference requests
Not exposed publicly
Networking Design
Security Model

Only the API VM is publicly accessible.

API VM

Allowed:

SSH (22)
HTTP API (3111)
Inference VM

Allowed:

RPC port (49134) only from API VM security group
SSH from API VM

The inference machine is not exposed to the public internet.

Infrastructure as Code

Terraform files are inside:

quickstart/terraform
Terraform Structure
terraform/
├── provider.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
Run Terraform

Initialize:

terraform init

Validate:

terraform validate

Preview:

terraform plan

Provision:

terraform apply

Example outputs:

api_public_ip = <public-ip>
inference_private_ip = <private-ip>
Deployment Steps
1. Clone Repository
git clone <repo-url>
cd quickstart
2. Start API VM

Start iii engine:

iii

Start caller worker:

cd workers/caller-worker
bun src/worker.ts
3. Start Inference VM

Activate environment:

source .venv311/bin/activate

Start worker:

python3.11 inference_worker.py
API Endpoint
POST /v1/chat/completions

Example:

curl -X POST http://127.0.0.1:3111/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
  "messages": [
    {
      "role":"user",
      "content":"Explain Redis in simple words"
    }
  ]
}'
Challenges Faced & Debugging
1. SSH Connectivity Issues

Problem:

Could not SSH into instances

Fix:

Corrected Security Groups and Network ACL configuration
Verified port 22 access
2. RPC Connectivity Failure

Problem:

Workers could not communicate

Fix:

Configured private subnet networking
Verified RPC communication on port 49134
Validated connectivity using nc
3. Storage Issues

Problem:

No space left on device

Fix:

Expanded root volume from 8GB → 20GB
Resized filesystem
4. Memory Constraints

Problem:

Model loading caused OOM conditions

Fix:

Added swap memory
Reduced resource pressure during inference
5. Worker Registration / Routing

Problem:

RPC function registration failures
Incorrect engine routing

Fix:

Corrected worker-to-engine connections
Verified function registration and endpoint mapping
Tradeoffs

Due to limited compute resources (t3.micro), inference latency was higher than expected for CPU-only model execution.

The system successfully validates:

Multi-VM deployment
Private subnet communication
RPC worker orchestration
HTTP API routing
Infrastructure-as-Code provisioning
End-to-end request flow to inference layer

Further optimization would include:

Larger instance types
Faster inference runtime
Containerization
CI/CD automation
Evidence

Screenshots included:

Terraform provisioning
VPC and subnet setup
EC2 instances
Security groups
Worker registration logs
RPC communication
API invocation
Model prompt execution
Technologies Used
AWS EC2
Terraform
iii Engine
Python
TypeScript
Bun
GGUF Models
Gemma 3 270M
Linux
SSH
Networking (VPC, NAT, Security Groups)

This structure directly maps to the assignment signals: infra thinking, networking, IaC, deployment, debugging, RPC, documentation, and reproducibility. :contentReference[oaicite:1]{index=1}
::contentReference[oaicite:2]{index=2}



# Distributed Multi-VM Inference System on AWS

This project deploys a distributed inference system using AWS and the iii quickstart project. The system is split across multiple virtual machines inside a private network and exposes model inference through a JSON HTTP API.

## Architecture

The system is deployed across two EC2 instances inside a custom VPC.

```text
                Internet
                    │
                    ▼
        ┌─────────────────────┐
        │ API VM (Public)     │
        │ Public Subnet       │
        │ iii HTTP API :3111  │
        │ caller-worker       │
        └─────────┬───────────┘
                  │ RPC over private subnet
                  ▼
        ┌─────────────────────┐
        │ Inference VM        │
        │ Private Subnet      │
        │ iii Engine :49134   │
        │ inference-worker    │
        │ Gemma 3 270M GGUF   │
        └─────────────────────┘
```

### High-Level Flow

1. Client sends request to `/v1/chat/completions`
2. API VM receives request through `iii-http`
3. `caller-worker` forwards request via RPC
4. Inference worker executes model inference
5. Response is returned to API layer

---

## Infrastructure

Provisioned using Terraform.

### Components

* Custom VPC
* Public subnet (API VM)
* Private subnet (Inference VM)
* Internet Gateway
* NAT Gateway
* Route tables
* Security Groups
* 2 EC2 instances
* Terraform outputs

### VM Design

#### API VM (Public Subnet)

Responsibilities:

* Hosts HTTP API (`127.0.0.1:3111`)
* Runs `caller-worker`
* Accepts incoming traffic
* Communicates with inference worker via private networking

#### Inference VM (Private Subnet)

Responsibilities:

* Runs inference worker
* Loads Gemma 3 270M GGUF model
* Handles inference requests
* Not exposed publicly

---

## Networking Design

### Security Model

Only the API VM is publicly accessible.

#### API VM

Allowed:

* SSH (`22`)
* HTTP API (`3111`)

#### Inference VM

Allowed:

* RPC port (`49134`) only from API VM security group
* SSH from API VM

The inference machine is not exposed to the public internet.

---

## Infrastructure as Code

Terraform files are inside:

```text
quickstart/terraform
```

### Terraform Structure

```text
terraform/
├── provider.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
```

### Run Terraform

Initialize:

```bash
terraform init
```

Validate:

```bash
terraform validate
```

Preview:

```bash
terraform plan
```

Provision:

```bash
terraform apply
```

Example outputs:

```text
api_public_ip = <public-ip>
inference_private_ip = <private-ip>
```

---

## Deployment Steps

### 1. Clone Repository

```bash
git clone <repo-url>
cd quickstart
```

### 2. Start API VM

Start iii engine:

```bash
iii
```

Start caller worker:

```bash
cd workers/caller-worker
bun src/worker.ts
```

### 3. Start Inference VM

Activate environment:

```bash
source .venv311/bin/activate
```

Start worker:

```bash
python3.11 inference_worker.py
```

---

## API Endpoint

### POST `/v1/chat/completions`

Example:

```bash
curl -X POST http://127.0.0.1:3111/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
  "messages": [
    {
      "role":"user",
      "content":"Explain Redis in simple words"
    }
  ]
}'
```

---

## Challenges Faced & Debugging

### 1. SSH Connectivity Issues

**Problem:**

* Could not SSH into instances

**Fix:**

* Corrected Security Groups and Network ACL configuration
* Verified port `22` access

### 2. RPC Connectivity Failure

**Problem:**

* Workers could not communicate

**Fix:**

* Configured private subnet networking
* Verified RPC communication on port `49134`
* Validated connectivity using `nc`

### 3. Storage Issues

**Problem:**

```text
No space left on device
```

**Fix:**

* Expanded root volume from `8GB → 20GB`
* Resized filesystem

### 4. Memory Constraints

**Problem:**

* Model loading caused OOM conditions

**Fix:**

* Added swap memory
* Reduced resource pressure during inference

### 5. Worker Registration / Routing

**Problem:**

* RPC function registration failures
* Incorrect engine routing

**Fix:**

* Corrected worker-to-engine connections
* Verified function registration and endpoint mapping

---

## Tradeoffs

Due to limited compute resources (`t3.micro`), inference latency was higher than expected for CPU-only model execution.

The system successfully validates:

* Multi-VM deployment
* Private subnet communication
* RPC worker orchestration
* HTTP API routing
* Infrastructure-as-Code provisioning
* End-to-end request flow to inference layer

Further optimization would include:

* Larger instance types
* Faster inference runtime
* Containerization
* CI/CD automation

---

## Evidence

Screenshots included:

* Terraform provisioning
* VPC and subnet setup
* EC2 instances
* Security groups
* Worker registration logs
* RPC communication
* API invocation
* Model prompt execution

---

## Technologies Used

* AWS EC2
* Terraform
* iii Engine
* Python
* TypeScript
* Bun
* GGUF Models
* Gemma 3 270M
* Linux
* SSH
* Networking (VPC, NAT, Security Groups)
