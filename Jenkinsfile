 pipeline {
 
agent any
 
environment {
 
IMAGE = "linkedin-frontend:${BUILD_NUMBER}"
 
CONT = "linkedin-frontend"
 
}
 
stages {
 
stage('Checkout') {
 
steps { checkout scm }
 
}
 
stage('Debug') {
    steps {
        bat 'echo IMAGE=%IMAGE%'
    }
}
 
stage('Build Docker Image') {
 
steps {
 
bat 'docker build -t %IMAGE% .'
 
}
 
}
 
stage('Run Container') {
 
steps {
 
bat 'docker rm -f %CONT% || true'
 
bat 'docker run -d --name %CONT% -p 4200:80 %IMAGE%'
 
}
 
}
 
}
}
 