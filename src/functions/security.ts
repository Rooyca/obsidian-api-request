import sanitizeHtmlLib from 'sanitize-html';

/**
 * Security utilities for input validation and sanitization
 */

/**
 * Validates a URL to ensure it's safe to request
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }
        
        // Prevent local network access (optional - can be configured)
        // Uncomment to prevent requests to localhost/private IPs
        // const hostname = parsed.hostname.toLowerCase();
        // if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
        //     return false;
        // }
        
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Validates HTTP method
 * @param method - The HTTP method to validate
 * @returns true if valid, false otherwise
 */
export function isValidMethod(method: string): boolean {
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
    return allowedMethods.includes(method.toUpperCase());
}

/**
 * Sanitizes a UUID to prevent injection attacks
 * @param uuid - The UUID to sanitize
 * @returns Sanitized UUID or null if invalid
 */
export function sanitizeUuid(uuid: string): string | null {
    if (!uuid || typeof uuid !== 'string') {
        return null;
    }
    
    // Only allow alphanumeric characters, hyphens, and underscores
    const sanitized = uuid.replace(/[^a-zA-Z0-9\-_]/g, '');
    
    // Limit length to prevent storage issues
    if (sanitized.length > 100) {
        return sanitized.substring(0, 100);
    }
    
    return sanitized || null;
}

/**
 * Validates JSONPath expression to prevent malicious code execution
 * @param jsonPath - The JSONPath expression to validate
 * @returns true if valid, false otherwise
 */
export function isValidJsonPath(jsonPath: string): boolean {
    if (!jsonPath || typeof jsonPath !== 'string') {
        return false;
    }
    
    // Check for potential script injection
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i, // event handlers like onclick=
        /eval\(/i,
        /Function\(/i,
        /setTimeout\(/i,
        /setInterval\(/i,
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(jsonPath)) {
            return false;
        }
    }
    
    // Basic JSONPath should start with $ or be a simple path
    if (!jsonPath.startsWith('$') && !jsonPath.startsWith('.')) {
        return false;
    }
    
    return true;
}

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') {
        return '';
    }

    return sanitizeHtmlLib(html, {
        allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
            ...sanitizeHtmlLib.defaults.allowedAttributes,
            '*': ['class', 'id']
        },
        allowedSchemes: ['http', 'https'],
        allowedSchemesByTag: {
            img: ['http', 'https', 'data']
        },
        disallowedTagsMode: 'discard'
    });
}

/**
 * Validates format string to prevent XSS
 * @param format - The format string to validate
 * @returns true if valid, false otherwise
 */
export function isValidFormat(format: string): boolean {
    if (!format || typeof format !== 'string') {
        return true; // Empty format is valid
    }
    
    // Check for script tags and event handlers
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /<embed/i,
        /<object/i,
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(format)) {
            return false;
        }
    }
    
    return true;
}

/**
 * Validates file path to prevent directory traversal attacks
 * @param filePath - The file path to validate
 * @returns true if valid, false otherwise
 */
export function isValidFilePath(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') {
        return false;
    }
    
    // Prevent directory traversal
    if (filePath.includes('..') || filePath.includes('//')) {
        return false;
    }
    
    // Prevent absolute paths (should be relative to vault)
    if (filePath.startsWith('/') || filePath.match(/^[a-zA-Z]:\\/)) {
        return false;
    }
    
    return true;
}

/**
 * Safely parse JSON with error handling
 * @param jsonString - The JSON string to parse
 * @returns Parsed object or null if invalid
 */
export function safeJsonParse(jsonString: string): any {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

/**
 * Validates localStorage key to prevent attacks
 * @param key - The localStorage key to validate
 * @returns true if valid, false otherwise
 */
export function isValidStorageKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
        return false;
    }
    
    // Only allow safe characters
    return /^[a-zA-Z0-9\-_]+$/.test(key);
}
