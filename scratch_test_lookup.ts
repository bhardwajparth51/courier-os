import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { CustomerService } from "./lib/services/customer.service";

async function main() {
  const result = await CustomerService.lookupByPhone("9822012345");
  console.log("LOOKUP_SUCCESS:", result);
}

main().catch((err) => console.error("LOOKUP_ERR:", err)).finally(() => process.exit(0));
