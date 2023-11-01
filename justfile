export PATH := './target/bin:' + env_var('PATH')
soroban := 'target/bin/soroban'

@setup:
    echo {{ if path_exists(soroban) == "true" { "" } else { `cargo install_soroban` } }}
    soroban config network add testnet \
                   --network-passphrase "Test SDF Network ; September 2015" \
                   --rpc-url "https://soroban-testnet.stellar.org:443"

generate:
    npm run bindings

@setup-node:
    npm i

dev:
    npm run dev

@clean:
    rm -rf ./target/bin