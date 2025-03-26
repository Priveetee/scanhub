// Types
export interface CVEResult {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
    title: string;
    description: string;
    affected_packages: string[];
    published_date: string;
    cvss_score?: number;
    references?: string[];
  }
  
  // In a real application, this would call your backend API
  export async function searchCVEs(image: string, registry: string): Promise<CVEResult[]> {
    // This is a mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        if (image.includes('nginx') || image.includes('apache')) {
          resolve([
            {
              id: 'CVE-2023-4278',
              severity: 'critical',
              title: 'Buffer Overflow in HTTP/2 Protocol',
              description: 'A buffer overflow vulnerability in the HTTP/2 protocol handler allows remote attackers to execute arbitrary code via crafted requests. The vulnerability affects the way the server processes HTTP/2 frames, potentially allowing memory corruption.',
              affected_packages: [image, 'libssl1.1', 'openssl'],
              published_date: '2023-09-15',
              cvss_score: 9.8,
              references: [
                'https://nvd.nist.gov/vuln/detail/CVE-2023-4278',
                'https://github.com/security/advisories/GHSA-123'
              ]
            },
            {
              id: 'CVE-2023-3789',
              severity: 'high',
              title: 'Directory Traversal in Configuration Parser',
              description: 'A directory traversal vulnerability exists in the configuration file parser that could allow an attacker with access to configuration files to read arbitrary files on the system.',
              affected_packages: [image],
              published_date: '2023-08-20',
              cvss_score: 7.5,
              references: [
                'https://nvd.nist.gov/vuln/detail/CVE-2023-3789'
              ]
            },
            {
              id: 'CVE-2023-2542',
              severity: 'medium',
              title: 'Information Disclosure in Error Responses',
              description: 'An information disclosure vulnerability that could reveal sensitive server information through verbose error messages when processing malformed requests.',
              affected_packages: [image, 'libpcre3'],
              published_date: '2023-06-12',
              cvss_score: 5.3
            },
            {
              id: 'CVE-2022-9634',
              severity: 'low',
              title: 'Cross-Site Scripting in Default Page',
              description: 'A Cross-Site Scripting (XSS) vulnerability in the default welcome page could allow attackers to inject malicious scripts that execute in the context of victims\' browsers.',
              affected_packages: [image],
              published_date: '2022-11-03',
              cvss_score: 3.5
            }
          ]);
        } else if (image.includes('postgres') || image.includes('mysql')) {
          resolve([
            {
              id: 'CVE-2023-5432',
              severity: 'high',
              title: 'SQL Injection in Authentication Module',
              description: 'A SQL injection vulnerability in the authentication module allows attackers to bypass authentication and execute arbitrary SQL commands on the database server.',
              affected_packages: [image, 'libpq5'],
              published_date: '2023-10-02',
              cvss_score: 8.2
            },
            {
              id: 'CVE-2023-4813',
              severity: 'medium',
              title: 'Privilege Escalation through Stored Procedures',
              description: 'A vulnerability in the stored procedure handler could allow unprivileged users to escalate privileges by executing specially crafted queries.',
              affected_packages: [image],
              published_date: '2023-09-17',
              cvss_score: 6.5
            }
          ]);
        } else if (image.includes('node')) {
          resolve([
            {
              id: 'CVE-2023-7891',
              severity: 'high',
              title: 'Path Traversal in Static File Server',
              description: 'A path traversal vulnerability in the static file serving component allows attackers to access files outside the intended directory.',
              affected_packages: [image, 'express'],
              published_date: '2023-11-05',
              cvss_score: 7.8
            }
          ]);
        } else {
          // Return empty array for other images
          resolve([]);
        }
      }, 1500); // Simulate network delay
    });
  }
  
  // Get details for a specific CVE
  export async function getCVEDetails(cveId: string): Promise<CVEResult | null> {
    // This would normally call your API to get detailed information
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock implementation
        resolve(null);
      }, 800);
    });
  }