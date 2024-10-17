// queueUtils.ts
export function generateQueueKey(bitmask: number, category?: string, difficulty?: string): string {
    const bitstring = bitmask.toString(2).padStart(2, '0'); // Ensures a 2-bit string (for future extensibility)
    let key = `queue:${bitstring}`;
    
    if (category) {
        key += `:${category}`;
    }
    
    if (difficulty) {
        key += `:${difficulty}`;
    }
    
    return key;
}
