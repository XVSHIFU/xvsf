/** @type {import('next').NextConfig} */
const nextConfig = {
  // The production host has 1.6 GiB RAM. Keep build fan-out bounded so a
  // deployment cannot starve sshd and PostgreSQL.
  experimental: {
    cpus: 1,
    memoryBasedWorkersCount: false,
  },
};

export default nextConfig;
