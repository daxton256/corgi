# Corgi

A program that encodes HTTP requests into images. This program was originally created to circumvent the restrictions and add REST data to HTTP requests in code.org.

## Issues

Responses must be less than 585 KB, if any response exceeds this limit, the server will send an encoded message reading "response too large."

Requests are slow and take around ~2000ms to process on the client-side.

If a request does not provide a response in the first ~2000ms, code.org's media fetch server will automatically timeout the request and not process it. This means that this requests library is not yet ready for tasks like AI APIS or any other request that takes significant server-side processing time.

## Use in code.org

Coming soon.

## Server Setup

Install the needed packages

    pip install -r requirements.txt

Run the server (Windows)

    start.bat