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
  
  // Database of mock CVEs we can search and retrieve
  const mockCVEDatabase: Record<string, CVEResult> = {
    'CVE-2023-4278': {
      id: 'CVE-2023-4278',
      severity: 'critical',
      title: 'Buffer Overflow in HTTP/2 Protocol',
      description: 'A buffer overflow vulnerability in the HTTP/2 protocol handler allows remote attackers to execute arbitrary code via crafted requests. The vulnerability affects the way the server processes HTTP/2 frames, potentially allowing memory corruption.',
      affected_packages: ['nginx', 'apache', 'libssl1.1', 'openssl'],
      published_date: '2023-09-15',
      cvss_score: 9.8,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-4278',
        'https://github.com/security/advisories/GHSA-123'
      ]
    },
    'CVE-2023-3789': {
      id: 'CVE-2023-3789',
      severity: 'high',
      title: 'Directory Traversal in Configuration Parser',
      description: 'A directory traversal vulnerability exists in the configuration file parser that could allow an attacker with access to configuration files to read arbitrary files on the system.',
      affected_packages: ['nginx', 'apache'],
      published_date: '2023-08-20',
      cvss_score: 7.5,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-3789'
      ]
    },
    'CVE-2023-2542': {
      id: 'CVE-2023-2542',
      severity: 'medium',
      title: 'Information Disclosure in Error Responses',
      description: 'An information disclosure vulnerability that could reveal sensitive server information through verbose error messages when processing malformed requests.',
      affected_packages: ['nginx', 'apache', 'libpcre3'],
      published_date: '2023-06-12',
      cvss_score: 5.3
    },
    'CVE-2022-9634': {
      id: 'CVE-2022-9634',
      severity: 'low',
      title: 'Cross-Site Scripting in Default Page',
      description: 'A Cross-Site Scripting (XSS) vulnerability in the default welcome page could allow attackers to inject malicious scripts that execute in the context of victims\' browsers.',
      affected_packages: ['nginx', 'apache'],
      published_date: '2022-11-03',
      cvss_score: 3.5
    },
    'CVE-2023-5432': {
      id: 'CVE-2023-5432',
      severity: 'high',
      title: 'SQL Injection in Authentication Module',
      description: 'A SQL injection vulnerability in the authentication module allows attackers to bypass authentication and execute arbitrary SQL commands on the database server.',
      affected_packages: ['postgres', 'mysql', 'libpq5'],
      published_date: '2023-10-02',
      cvss_score: 8.2
    },
    'CVE-2023-4813': {
      id: 'CVE-2023-4813',
      severity: 'medium',
      title: 'Privilege Escalation through Stored Procedures',
      description: 'A vulnerability in the stored procedure handler could allow unprivileged users to escalate privileges by executing specially crafted queries.',
      affected_packages: ['postgres', 'mysql'],
      published_date: '2023-09-17',
      cvss_score: 6.5
    },
    'CVE-2023-7891': {
      id: 'CVE-2023-7891',
      severity: 'high',
      title: 'Path Traversal in Static File Server',
      description: 'A path traversal vulnerability in the static file serving component allows attackers to access files outside the intended directory.',
      affected_packages: ['node', 'express'],
      published_date: '2023-11-05',
      cvss_score: 7.8
    },
    // New CVEs for existing images
    'CVE-2023-9876': {
      id: 'CVE-2023-9876',
      severity: 'critical',
      title: 'Remote Code Execution in Web Server',
      description: 'A vulnerability in the request handler allows remote attackers to execute arbitrary code with server privileges through specially crafted HTTP requests.',
      affected_packages: ['nginx', 'apache'],
      published_date: '2023-12-01',
      cvss_score: 9.5,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-9876',
        'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-9876'
      ]
    },
    'CVE-2023-5678': {
      id: 'CVE-2023-5678',
      severity: 'high',
      title: 'Database Connection Pooling Vulnerability',
      description: 'A flaw in the connection pooling mechanism allows attackers to obtain unauthorized access to database connections, potentially leading to data theft or corruption.',
      affected_packages: ['postgres', 'mysql', 'mariadb'],
      published_date: '2023-11-15',
      cvss_score: 8.0,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-5678'
      ]
    },
    'CVE-2023-8765': {
      id: 'CVE-2023-8765',
      severity: 'medium',
      title: 'Prototype Pollution in Package Manager',
      description: 'A prototype pollution vulnerability in the package management system allows attackers to manipulate object prototypes and potentially execute arbitrary code.',
      affected_packages: ['node', 'npm'],
      published_date: '2023-10-30',
      cvss_score: 6.2,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-8765',
        'https://github.com/security/advisories/GHSA-456'
      ]
    },
    // Python vulnerabilities
    'CVE-2023-6789': {
      id: 'CVE-2023-6789',
      severity: 'high',
      title: 'Remote Code Execution in Python WSGI Handler',
      description: 'A vulnerability in the WSGI request handling allows attackers to execute arbitrary Python code through maliciously crafted requests.',
      affected_packages: ['python', 'python3', 'flask', 'django'],
      published_date: '2023-09-25',
      cvss_score: 8.3,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-6789'
      ]
    },
    'CVE-2023-4567': {
      id: 'CVE-2023-4567',
      severity: 'medium',
      title: 'YAML Parser Deserialization Vulnerability',
      description: 'A vulnerability in the YAML parser allows attackers to perform arbitrary code execution via deserialization of untrusted data.',
      affected_packages: ['python', 'python3', 'pyyaml'],
      published_date: '2023-08-14',
      cvss_score: 6.8
    },
    // Java vulnerabilities
    'CVE-2023-3456': {
      id: 'CVE-2023-3456',
      severity: 'critical',
      title: 'Remote Code Execution in Spring Framework',
      description: 'A vulnerability in Spring Framework\'s core component allows remote attackers to execute arbitrary code via crafted HTTP requests.',
      affected_packages: ['java', 'openjdk', 'spring-core', 'spring-boot'],
      published_date: '2023-07-19',
      cvss_score: 9.6,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-3456',
        'https://spring.io/security/cve-2023-3456'
      ]
    },
    // Ubuntu/Debian vulnerabilities
    'CVE-2023-2345': {
      id: 'CVE-2023-2345',
      severity: 'high',
      title: 'Privilege Escalation in System Service',
      description: 'A vulnerability in a core system service allows local users to escalate privileges to root through a malformed configuration file.',
      affected_packages: ['ubuntu', 'debian', 'systemd'],
      published_date: '2023-05-22',
      cvss_score: 7.8,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-2345',
        'https://ubuntu.com/security/CVE-2023-2345'
      ]
    },
    // Redis vulnerabilities
    'CVE-2023-8901': {
      id: 'CVE-2023-8901',
      severity: 'medium',
      title: 'Memory Disclosure in Redis Command Handling',
      description: 'A vulnerability in Redis\'s command handling could allow an attacker to read portions of memory by sending specially crafted commands.',
      affected_packages: ['redis', 'redis-server'],
      published_date: '2023-10-17',
      cvss_score: 5.9
    },
    // Additional nginx/apache vulnerabilities
    'CVE-2023-1234': {
      id: 'CVE-2023-1234',
      severity: 'high',
      title: 'Cache Poisoning Vulnerability in Reverse Proxy',
      description: 'A vulnerability in the reverse proxy caching mechanism that allows attackers to manipulate cache entries and serve malicious content to other users.',
      affected_packages: ['nginx', 'apache'],
      published_date: '2023-04-12',
      cvss_score: 7.3,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-1234',
        'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-1234'
      ]
    },
    'CVE-2023-7733': {
      id: 'CVE-2023-7733',
      severity: 'medium',
      title: 'TLS Certificate Validation Bypass',
      description: 'A flaw in the TLS certificate validation allows attackers to bypass certificate checks in certain configurations.',
      affected_packages: ['nginx', 'apache', 'openssl'],
      published_date: '2023-08-03',
      cvss_score: 6.4,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-7733'
      ]
    },
    
    // Additional database vulnerabilities
    'CVE-2023-2288': {
      id: 'CVE-2023-2288',
      severity: 'critical',
      title: 'Remote Arbitrary Code Execution in Database Engine',
      description: 'A critical vulnerability in the query execution engine that allows remote attackers to execute arbitrary code with database server privileges.',
      affected_packages: ['postgres', 'mysql', 'mariadb'],
      published_date: '2023-06-30',
      cvss_score: 9.2,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-2288'
      ]
    },
    'CVE-2022-8976': {
      id: 'CVE-2022-8976',
      severity: 'low',
      title: 'Information Leakage in Error Messages',
      description: 'Database error messages may reveal sensitive information about database structure and queries when triggered by malformed input.',
      affected_packages: ['postgres', 'mysql'],
      published_date: '2022-12-18',
      cvss_score: 3.7
    },
    
    // Additional Node.js vulnerabilities
    'CVE-2023-4499': {
      id: 'CVE-2023-4499',
      severity: 'critical',
      title: 'Remote Code Execution in Template Engine',
      description: 'A vulnerability in a popular Node.js template engine allows attackers to execute arbitrary code when malicious templates are processed.',
      affected_packages: ['node', 'npm', 'handlebars', 'ejs'],
      published_date: '2023-07-22',
      cvss_score: 9.3,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-4499',
        'https://github.com/security/advisories/GHSA-789'
      ]
    },
    'CVE-2023-5523': {
      id: 'CVE-2023-5523',
      severity: 'high',
      title: 'Regular Expression Denial of Service',
      description: 'A Regular Expression Denial of Service (ReDoS) vulnerability in a core string processing library can cause server unresponsiveness when processing certain input patterns.',
      affected_packages: ['node', 'npm', 'express'],
      published_date: '2023-09-08',
      cvss_score: 7.5
    },
    
    // Additional Python vulnerabilities
    'CVE-2023-9922': {
      id: 'CVE-2023-9922',
      severity: 'critical',
      title: 'Arbitrary Code Execution in Pickle Module',
      description: 'A vulnerability in Python\'s pickle module allowing attackers to execute arbitrary code when deserializing malicious data.',
      affected_packages: ['python', 'python3'],
      published_date: '2023-11-10',
      cvss_score: 9.8,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-9922'
      ]
    },
    'CVE-2023-7654': {
      id: 'CVE-2023-7654',
      severity: 'high',
      title: 'SQL Injection in ORM Framework',
      description: 'A SQL injection vulnerability in a popular Python ORM framework allows attackers to execute arbitrary SQL commands via crafted input parameters.',
      affected_packages: ['python', 'python3', 'django', 'sqlalchemy'],
      published_date: '2023-10-05',
      cvss_score: 8.1,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-7654',
        'https://www.python.org/dev/security/CVE-2023-7654'
      ]
    },
    
    // Additional Java vulnerabilities
    'CVE-2023-8432': {
      id: 'CVE-2023-8432',
      severity: 'high',
      title: 'XML External Entity Injection',
      description: 'An XML External Entity (XXE) vulnerability in Java XML parsing libraries allows attackers to read arbitrary files or conduct server-side request forgery attacks.',
      affected_packages: ['java', 'openjdk', 'jaxb'],
      published_date: '2023-09-11',
      cvss_score: 7.7,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-8432'
      ]
    },
    'CVE-2023-3990': {
      id: 'CVE-2023-3990',
      severity: 'medium',
      title: 'Deserialization Vulnerability in Java Libraries',
      description: 'A vulnerability in Java object deserialization that could allow attackers to execute arbitrary code by providing malicious serialized objects.',
      affected_packages: ['java', 'openjdk', 'tomcat', 'spring-boot'],
      published_date: '2023-06-22',
      cvss_score: 6.8
    },
    
    // Additional Redis vulnerabilities
    'CVE-2023-6721': {
      id: 'CVE-2023-6721',
      severity: 'high',
      title: 'Authentication Bypass in Redis ACL',
      description: 'A vulnerability in Redis\'s Access Control List implementation allows attackers to bypass authentication checks in certain configurations.',
      affected_packages: ['redis', 'redis-server'],
      published_date: '2023-08-30',
      cvss_score: 8.0,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-6721',
        'https://redis.io/security/CVE-2023-6721'
      ]
    },
    
    // Golang vulnerabilities
    'CVE-2023-5482': {
      id: 'CVE-2023-5482',
      severity: 'high',
      title: 'HTTP Request Smuggling in Go HTTP Server',
      description: 'A vulnerability in Go\'s HTTP server implementation allows attackers to perform HTTP request smuggling attacks, potentially bypassing security controls.',
      affected_packages: ['golang', 'go'],
      published_date: '2023-09-28',
      cvss_score: 7.6,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-5482',
        'https://go.dev/security/CVE-2023-5482'
      ]
    },
    'CVE-2023-7788': {
      id: 'CVE-2023-7788',
      severity: 'medium',
      title: 'Race Condition in Golang Concurrency',
      description: 'A race condition in Golang\'s concurrency primitives can lead to memory corruption or unexpected behavior in multi-threaded applications.',
      affected_packages: ['golang', 'go'],
      published_date: '2023-10-15',
      cvss_score: 5.7
    },
    
    // Docker/container vulnerabilities
    'CVE-2023-9876': {
      id: 'CVE-2023-9876',
      severity: 'critical',
      title: 'Container Escape Vulnerability',
      description: 'A vulnerability in the container runtime allows attackers to escape container isolation and gain access to the host system.',
      affected_packages: ['docker', 'containerd', 'kubernetes'],
      published_date: '2023-11-02',
      cvss_score: 9.6,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-9876',
        'https://github.com/docker/security/CVE-2023-9876'
      ]
    },
    'CVE-2023-3311': {
      id: 'CVE-2023-3311',
      severity: 'high',
      title: 'Privilege Escalation in Image Building',
      description: 'A vulnerability in the container image building process allows attackers to escalate privileges during build time and potentially inject malicious code.',
      affected_packages: ['docker', 'buildkit', 'podman'],
      published_date: '2023-07-14',
      cvss_score: 8.2,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-3311'
      ]
    },
    
    // WordPress vulnerabilities
    'CVE-2023-4545': {
      id: 'CVE-2023-4545',
      severity: 'high',
      title: 'Unauthenticated SQL Injection in WordPress Plugin',
      description: 'An unauthenticated SQL injection vulnerability in a popular WordPress plugin allows attackers to extract sensitive data from the database.',
      affected_packages: ['wordpress', 'wp-plugin-contact-form-7'],
      published_date: '2023-08-17',
      cvss_score: 8.4,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-4545',
        'https://wordpress.org/security/CVE-2023-4545'
      ]
    },
    'CVE-2023-6789': {
      id: 'CVE-2023-6789',
      severity: 'medium',
      title: 'Cross-Site Scripting in WordPress Core',
      description: 'A stored Cross-Site Scripting (XSS) vulnerability in WordPress core allows attackers to inject malicious scripts that execute in administrators\' browsers.',
      affected_packages: ['wordpress', 'php'],
      published_date: '2023-10-11',
      cvss_score: 6.1
    },
    
    // Ruby/Rails vulnerabilities
    'CVE-2023-7812': {
      id: 'CVE-2023-7812',
      severity: 'critical',
      title: 'Remote Code Execution in Rails',
      description: 'A vulnerability in Ruby on Rails allows remote attackers to execute arbitrary code via crafted requests to the application.',
      affected_packages: ['ruby', 'rails', 'ruby-on-rails'],
      published_date: '2023-09-20',
      cvss_score: 9.1,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-7812',
        'https://rubyonrails.org/security/CVE-2023-7812'
      ]
    },
    'CVE-2023-5632': {
      id: 'CVE-2023-5632',
      severity: 'high',
      title: 'Insecure Deserialization in Ruby Gems',
      description: 'A vulnerability in Ruby\'s gem handling allows attackers to execute arbitrary code when deserializing malicious gem data.',
      affected_packages: ['ruby', 'rubygems'],
      published_date: '2023-07-29',
      cvss_score: 7.9
    },
    
    // PHP vulnerabilities
    'CVE-2023-8843': {
      id: 'CVE-2023-8843',
      severity: 'critical',
      title: 'Remote Code Execution in PHP Core',
      description: 'A vulnerability in PHP\'s core functionality allows remote attackers to execute arbitrary code on the server.',
      affected_packages: ['php', 'php-fpm'],
      published_date: '2023-11-05',
      cvss_score: 9.5,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-8843',
        'https://php.net/security/CVE-2023-8843'
      ]
    },
    'CVE-2023-4142': {
      id: 'CVE-2023-4142',
      severity: 'high',
      title: 'Object Injection in PHP Sessions',
      description: 'A vulnerability in PHP\'s session handling allows attackers to inject arbitrary objects, potentially leading to code execution.',
      affected_packages: ['php', 'laravel', 'symfony'],
      published_date: '2023-06-19',
      cvss_score: 8.1
    },
    
    // MongoDB vulnerabilities
    'CVE-2023-5721': {
      id: 'CVE-2023-5721',
      severity: 'high',
      title: 'Authentication Bypass in MongoDB',
      description: 'A vulnerability in MongoDB\'s authentication mechanism allows attackers to bypass authentication under certain conditions.',
      affected_packages: ['mongodb', 'mongo'],
      published_date: '2023-09-14',
      cvss_score: 8.5,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-5721',
        'https://www.mongodb.com/security/CVE-2023-5721'
      ]
    },
    'CVE-2023-3872': {
      id: 'CVE-2023-3872',
      severity: 'medium',
      title: 'Information Disclosure in MongoDB Logging',
      description: 'A vulnerability in MongoDB\'s logging functionality may disclose sensitive information, including authentication credentials, in log files.',
      affected_packages: ['mongodb', 'mongo'],
      published_date: '2023-07-11',
      cvss_score: 5.9
    },
    
    // AWS service vulnerabilities
    'CVE-2023-7654': {
      id: 'CVE-2023-7654',
      severity: 'high',
      title: 'IAM Role Privilege Escalation',
      description: 'A vulnerability in AWS IAM role assumption that allows attackers to escalate privileges in certain configurations.',
      affected_packages: ['aws', 'aws-cli', 'aws-iam'],
      published_date: '2023-10-22',
      cvss_score: 7.8,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-7654',
        'https://aws.amazon.com/security/CVE-2023-7654'
      ]
    },
    'CVE-2023-4329': {
      id: 'CVE-2023-4329',
      severity: 'medium',
      title: 'Information Disclosure in AWS Lambda',
      description: 'A vulnerability in AWS Lambda that could allow attackers to access environment variables from other functions in specific configurations.',
      affected_packages: ['aws', 'aws-lambda'],
      published_date: '2023-08-06',
      cvss_score: 6.2
    },
    
    // Elasticsearch vulnerabilities
    'CVE-2023-6190': {
      id: 'CVE-2023-6190',
      severity: 'high',
      title: 'Privilege Escalation in Elasticsearch',
      description: 'A vulnerability in Elasticsearch that allows attackers to escalate privileges through malformed search queries.',
      affected_packages: ['elasticsearch', 'elk'],
      published_date: '2023-09-30',
      cvss_score: 7.6,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-6190',
        'https://www.elastic.co/security/CVE-2023-6190'
      ]
    },
    'CVE-2023-2189': {
      id: 'CVE-2023-2189',
      severity: 'medium',
      title: 'Information Leakage in Elasticsearch API',
      description: 'A vulnerability in the Elasticsearch API that may expose sensitive cluster information to unauthorized users.',
      affected_packages: ['elasticsearch', 'kibana'],
      published_date: '2023-05-14',
      cvss_score: 5.5
    },
    
    // Windows vulnerabilities
    'CVE-2023-9999': {
      id: 'CVE-2023-9999',
      severity: 'critical',
      title: 'Remote Code Execution in Windows Server',
      description: 'A critical vulnerability in Windows Server that allows remote attackers to execute code with system privileges without authentication.',
      affected_packages: ['windows', 'windows-server'],
      published_date: '2023-12-10',
      cvss_score: 9.9,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-9999',
        'https://msrc.microsoft.com/update-guide/vulnerability/CVE-2023-9999'
      ]
    },
    'CVE-2023-8888': {
      id: 'CVE-2023-8888',
      severity: 'high',
      title: 'Windows Kernel Privilege Escalation',
      description: 'A vulnerability in the Windows kernel allowing local attackers to elevate privileges to SYSTEM level.',
      affected_packages: ['windows', 'windows-10', 'windows-11'],
      published_date: '2023-11-14',
      cvss_score: 7.9,
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2023-8888'
      ]
    }
  };
  
  // In a real application, this would call your backend API
  export async function searchCVEs(image: string, registry: string): Promise<CVEResult[]> {
    // This is a mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Convert image to lowercase for case-insensitive matching
        const lowerImage = image.toLowerCase();
        let results: CVEResult[] = [];
        
        if (lowerImage.includes('nginx') || lowerImage.includes('apache')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => pkg === 'nginx' || pkg === 'apache')
          );
        } else if (lowerImage.includes('postgres') || lowerImage.includes('mysql') || lowerImage.includes('mariadb')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['postgres', 'mysql', 'mariadb'].includes(pkg))
          );
        } else if (lowerImage.includes('node') || lowerImage.includes('nodejs')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['node', 'npm'].includes(pkg))
          );
        } else if (lowerImage.includes('python')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['python', 'python3'].includes(pkg))
          );
        } else if (lowerImage.includes('java') || lowerImage.includes('openjdk')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['java', 'openjdk'].includes(pkg))
          );
        } else if (lowerImage.includes('ubuntu') || lowerImage.includes('debian')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['ubuntu', 'debian'].includes(pkg))
          );
        } else if (lowerImage.includes('redis')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => pkg === 'redis')
          );
        } else if (lowerImage.includes('golang') || lowerImage.includes('go')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['golang', 'go'].includes(pkg))
          );
        } else if (lowerImage.includes('docker') || lowerImage.includes('container')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['docker', 'containerd', 'kubernetes'].includes(pkg))
          );
        } else if (lowerImage.includes('wordpress') || lowerImage.includes('wp')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => pkg === 'wordpress')
          );
        } else if (lowerImage.includes('ruby') || lowerImage.includes('rails')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['ruby', 'rails', 'ruby-on-rails'].includes(pkg))
          );
        } else if (lowerImage.includes('php')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['php', 'php-fpm'].includes(pkg))
          );
        } else if (lowerImage.includes('mongo')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['mongodb', 'mongo'].includes(pkg))
          );
        } else if (lowerImage.includes('aws')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => pkg.startsWith('aws'))
          );
        } else if (lowerImage.includes('elastic') || lowerImage.includes('elk')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => ['elasticsearch', 'elk', 'kibana'].includes(pkg))
          );
        } else if (lowerImage.includes('windows')) {
          results = Object.values(mockCVEDatabase).filter(cve => 
            cve.affected_packages.some(pkg => pkg.startsWith('windows'))
          );
        } else {
          // Return empty array for other images
          results = [];
        }
        
        resolve(results);
      }, 1500); // Simulate network delay
    });
  }
  
  // Get details for a specific CVE
  export async function getCVEDetails(cveId: string): Promise<CVEResult | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find the CVE in our mock database
        const cve = mockCVEDatabase[cveId];
        resolve(cve || null);
      }, 800);
    });
  }