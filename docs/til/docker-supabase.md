# Start the Docker server before Supabase

Supabase reported that it could not connect to the Docker engine. I checked
`docker version` and found a working client with no Server section. Docker
Desktop was still starting. Waiting for the engine, verifying the Server
section and rerunning `supabase start` let the local stack start.

[Local Supabase setup](https://supabase.com/docs/guides/local-development)
