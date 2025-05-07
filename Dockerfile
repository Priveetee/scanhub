FROM golang:1.21-alpine AS builder


# Force module mode
ENV GO111MODULE=on
WORKDIR /app


# Install dependencies
RUN apk add --no-cache git


# Copy source files
COPY . .


# Download Go modules and build the application
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o scanner-api ./cmd/api

FROM debian:latest


# Install necessary packages
RUN apk add --no-cache ca-certificates git
RUN update-ca-certificates



# Copy the binary and environment file
COPY --from=builder /app/scanner-api /usr/local/bin/
COPY .env /app/.env



WORKDIR /app
EXPOSE 12823
ENTRYPOINT ["/usr/local/bin/scanner-api"]
