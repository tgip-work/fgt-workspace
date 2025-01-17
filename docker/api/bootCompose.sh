#!/bin/bash -xe
if [ "$1" = "help" -o "$1" = "--help" -o "$1" = "-h" -o "$1" = "-?" ]; then
  echo "Usage:"
  echo
  echo "\t $0 [options]"
  echo
  echo "In options use keyword eth to turn on BC integration. Use keywork dev for DEV environment. Use keyword tst for TST environment."
  echo
  echo "Examples:"
  echo
  echo "\t $0"
  echo
  echo "\t $0 eth-dev"
  echo
  echo "\t $0 tst"
  exit 0
fi
params=".localhost"
simple="localhost"
swagger=".localhost:8080"
protocol="http"
if [[ "$1" = *"dev"* ]]; then
  params="-fgt-dev.pharmaledger.pdmfc.com"
  simple="fgt-dev.pharmaledger.pdmfc.com"
  swagger="$params"
  protocol=https
elif [[ "$1" = *"tst"* ]]; then
  params="-fgt.pharmaledger.pdmfc.com"
  simple="fgt.pharmaledger.pdmfc.com"
  swagger="$params"
  protocol=https
fi
if [[ "$1" = *"eth"* ]]; then
    echo "Launching docker compose in $params with ETH"
    SIMPLE=$simple DOMAIN=$params SWAGGER=$swagger PROTOCOL=$protocol COMMAND=$command docker-compose -f docker-compose.yml -f docker-compose-eth.yml up -d
else
    echo "Launching docker compose in $params without ETH"
    SIMPLE=$simple DOMAIN=$params SWAGGER=$swagger PROTOCOL=$protocol COMMAND=$command docker-compose up -d
fi
