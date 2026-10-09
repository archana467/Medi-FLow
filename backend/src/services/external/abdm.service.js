

class ABDMService {
    constructor() {
        this.gatewayUrl = process.env.ABDM_BASE_URL || 'https://dev.abdm.gov.in/gateway';
        this.clientId = process.env.ABDM_CLIENT_ID;
        this.clientSecret = process.env.ABDM_CLIENT_SECRET;
        
        // ABDM Registry URLs (Sandbox)
        this.hfrUrl = process.env.ABDM_HFR_URL || 'https://facility.abdm.gov.in/api/v1/facilities';
        this.hprUrl = process.env.ABDM_HPR_URL || 'https://hpr.abdm.gov.in/api/v1/search';
    }

    async getSessionToken() {
        if (!this.clientId || !this.clientSecret) {
            return null; // Missing credentials, integration will fallback gracefully
        }
        try {
            const response = await fetch(`${this.gatewayUrl}/v0.5/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: this.clientId, clientSecret: this.clientSecret })
            });
            if (!response.ok) {
                console.error(`ABDM session error: ${response.status} ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            return data.accessToken;
        } catch (error) {
            console.error('Error fetching ABDM session:', error.message);
            return null;
        }
    }

    /**
     * Search Health Facility Registry (HFR)
     */
    async searchFacilities(lat, lng, radius = 10) {
        const token = await this.getSessionToken();
        
        // GRACEFUL FALLBACK: If ABDM credentials are not configured, return demo data.
        if (!token) {
            return {
                status: 'fallback',
                message: 'ABDM Credentials missing. Please register at ABDM Sandbox. Showing fallback data.',
                data: [
                    { id: 'HFR-TEST-001', name: 'City Central Hospital', facilityType: 'Hospital', address: '123 Main St', city: 'Metro', location: { lat: parseFloat(lat), lng: parseFloat(lng) } },
                    { id: 'HFR-TEST-002', name: 'Sunrise Health Clinic', facilityType: 'Clinic', address: '45 Station Road', city: 'Metro', location: { lat: parseFloat(lat) + 0.01, lng: parseFloat(lng) + 0.01 } },
                    { id: 'HFR-TEST-003', name: 'Apex Diagnostic Center', facilityType: 'Diagnostic', address: '78 Park Ave', city: 'Metro', location: { lat: parseFloat(lat) - 0.01, lng: parseFloat(lng) - 0.005 } }
                ]
            };
        }

        try {
            const response = await fetch(`${this.hfrUrl}/search?lat=${lat}&lng=${lng}&radius=${radius}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CM-ID': 'sbx',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HFR API returned ${response.status}`);
            }
            
            const data = await response.json();
            return { status: 'success', data: data.facilities || [] };
        } catch (error) {
            console.error('ABDM HFR Error:', error.message);
            return { status: 'error', message: 'Failed to fetch from ABDM Health Facility Registry' };
        }
    }

    /**
     * Search Healthcare Professionals Registry (HPR)
     */
    async searchDoctors(specialization, location) {
        const token = await this.getSessionToken();
        
        // GRACEFUL FALLBACK
        if (!token) {
            return {
                status: 'fallback',
                message: 'ABDM Credentials missing. Showing fallback data.',
                data: [
                    { id: 'HPR-DOC-1', name: 'Dr. Jane Smith', specialization: specialization || 'Cardiologist', location: location || 'Any', registrationNumber: 'MCI-12345' },
                    { id: 'HPR-DOC-2', name: 'Dr. Rahul Sharma', specialization: specialization || 'Neurologist', location: location || 'Any', registrationNumber: 'MCI-67890' }
                ]
            };
        }

        try {
            let query = `?`;
            if (specialization) query += `speciality=${encodeURIComponent(specialization)}&`;
            if (location) query += `location=${encodeURIComponent(location)}`;
            
            const response = await fetch(`${this.hprUrl}${query}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CM-ID': 'sbx',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HPR API returned ${response.status}`);
            }
            
            const data = await response.json();
            return { status: 'success', data: data.doctors || [] };
        } catch (error) {
            console.error('ABDM HPR Error:', error.message);
            return { status: 'error', message: 'Failed to fetch from ABDM Healthcare Professionals Registry' };
        }
    }
}

export default new ABDMService();
