pipeline {

    agent any

    environment {

        ACR     = 'trelloacr'

        RG      = 'trello-rg'

        AKS     = 'trello-aks'

        IMAGE   = 'trello-ui'

        AZ_CLIENT_ID     = credentials('azure-client-id')

        AZ_CLIENT_SECRET = credentials('azure-client-secret')

        AZ_TENANT_ID     = credentials('azure-tenant-id')

    }

    stages {

        stage('Checkout') {

            steps { checkout scm }

        }

        stage('Build image') {

            steps {

                bat 'docker build --platform linux/amd64 -t %ACR%.azurecr.io/%IMAGE%:%BUILD_NUMBER% -t %ACR%.azurecr.io/%IMAGE%:latest .'

            }

        }

        stage('Login to Azure') {

            steps {

                bat 'az login --service-principal -u %AZ_CLIENT_ID% -p %AZ_CLIENT_SECRET% --tenant %AZ_TENANT_ID%'

                bat 'az acr login -n %ACR%'

            }

        }

        stage('Push to ACR') {

            steps {

                bat 'docker push %ACR%.azurecr.io/%IMAGE%:%BUILD_NUMBER%'

                bat 'docker push %ACR%.azurecr.io/%IMAGE%:latest'

            }

        }

        stage('Deploy to AKS') {

            steps {

                bat 'az aks get-credentials -n %AKS% -g %RG% --overwrite-existing'

                powershell '(Get-Content k8s/03-frontend.yaml) -replace "<ACR_NAME>", $env:ACR | Set-Content $env:TEMP\\03-frontend.yaml'

                bat 'kubectl apply -f %TEMP%\\03-frontend.yaml'

                bat 'kubectl set image deployment/trello-ui trello-ui=%ACR%.azurecr.io/%IMAGE%:%BUILD_NUMBER%'

                bat 'kubectl rollout status deployment/trello-ui --timeout=120s'

            }

        }

    }

    post {

        success { echo "trello-ui ${BUILD_NUMBER} deployed to AKS." }

        failure { echo 'trello-ui pipeline failed.' }

        always  { bat 'az logout || exit 0' }

    }