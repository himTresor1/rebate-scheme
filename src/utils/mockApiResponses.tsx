// Mock API response generators for eligibility checks

export const mockSocialRegistryCheck = (applicantName: string) => {
  // Simulate random outcomes for testing
  const outcomes = [
    {
      status: 'pass' as const,
      found: true,
      incomeLevel: 'Low (<RWF 105,000/month)',
      householdSize: 5,
      ubudeheCategory: 'Category 1',
      location: 'Kigali - Gasabo',
      registeredDate: '2023-01-15',
      checkedAt: new Date().toISOString()
    },
    {
      status: 'pass' as const,
      found: true,
      incomeLevel: 'Low (<RWF 105,000/month)',
      householdSize: 4,
      ubudeheCategory: 'Category 2',
      location: 'Kigali - Kicukiro',
      registeredDate: '2022-08-20',
      checkedAt: new Date().toISOString()
    },
    {
      status: 'fail' as const,
      found: false,
      reason: 'Applicant not found in Social Registry',
      checkedAt: new Date().toISOString()
    }
  ];
  
  // Use name length to deterministically pick outcome for consistent testing
  const index = applicantName.length % outcomes.length;
  return outcomes[index];
};

// NEW: Mock Additional Motorcycles Check
export const mockAdditionalMotorcyclesCheck = (nationalId: string) => {
  const outcomes = [
    {
      status: 'completed' as const,
      hasMultiple: false,
      motorcycles: [
        {
          plateNumber: 'RAE 789E',
          model: 'E-Motorcycle (Current Application)',
          brand: 'Ampersand',
          year: '2024',
          registeredDate: '2024-03-15',
          status: 'Pending Registration',
          chassisNumber: 'AMP2024789456'
        }
      ],
      totalCount: 1,
      message: 'No additional motorcycles registered',
      checkedAt: new Date().toISOString()
    },
    {
      status: 'completed' as const,
      hasMultiple: true,
      motorcycles: [
        {
          plateNumber: 'RAD 234B',
          model: 'TVS Apache',
          brand: 'TVS',
          year: '2020',
          registeredDate: '2020-08-10',
          status: 'Active',
          chassisNumber: 'TVS202012345'
        },
        {
          plateNumber: 'RAE 789E',
          model: 'E-Motorcycle (Current Application)',
          brand: 'Ampersand',
          year: '2024',
          registeredDate: '2024-03-15',
          status: 'Pending Registration',
          chassisNumber: 'AMP2024789456'
        }
      ],
      totalCount: 2,
      message: '1 additional motorcycle found - Requires review',
      checkedAt: new Date().toISOString()
    },
    {
      status: 'completed' as const,
      hasMultiple: true,
      motorcycles: [
        {
          plateNumber: 'RAD 123A',
          model: 'Bajaj Boxer',
          brand: 'Bajaj',
          year: '2018',
          registeredDate: '2018-05-20',
          status: 'Active',
          chassisNumber: 'BAJ201887654'
        },
        {
          plateNumber: 'RAD 567C',
          model: 'Honda CB',
          brand: 'Honda',
          year: '2021',
          registeredDate: '2021-11-05',
          status: 'Active',
          chassisNumber: 'HON202165432'
        },
        {
          plateNumber: 'RAE 789E',
          model: 'E-Motorcycle (Current Application)',
          brand: 'Ampersand',
          year: '2024',
          registeredDate: '2024-03-15',
          status: 'Pending Registration',
          chassisNumber: 'AMP2024789456'
        }
      ],
      totalCount: 3,
      message: '2 additional motorcycles found - Requires review',
      checkedAt: new Date().toISOString()
    }
  ];
  
  const index = nationalId.length % outcomes.length;
  return outcomes[index];
};

// NEW: Mock Document Authentication
export const mockDocumentAuthentication = (documentType: string, documentId: string) => {
  const outcomes = [
    {
      verified: true,
      status: 'authentic',
      verifiedAt: new Date().toISOString(),
      verificationMethod: `${documentType} API Verification`,
      confidence: 'High',
      message: 'Document verified successfully'
    },
    {
      verified: false,
      status: 'failed',
      verifiedAt: new Date().toISOString(),
      verificationMethod: `${documentType} API Verification`,
      confidence: 'Low',
      message: 'Document verification failed - discrepancies found'
    },
    {
      verified: true,
      status: 'authentic',
      verifiedAt: new Date().toISOString(),
      verificationMethod: `${documentType} API Verification`,
      confidence: 'Medium',
      message: 'Document verified with minor inconsistencies'
    }
  ];
  
  const index = documentId.length % outcomes.length;
  return outcomes[index];
};

export const mockRuraRraCheck = (applicantName: string) => {
  // Simulate different scenarios
  const outcomes = [
    {
      status: 'pass' as const,
      additionalMotos: [
        { 
          plate: 'RAD 123A', 
          type: 'ICE Motorcycle', 
          registeredYear: 2020,
          status: 'Active'
        }
      ],
      totalMotorcycles: 2,
      message: '1 additional motorcycle found in RURA/RRA records',
      checkedAt: new Date().toISOString()
    },
    {
      status: 'pass' as const,
      additionalMotos: [],
      totalMotorcycles: 1,
      message: 'No additional motorcycles found',
      checkedAt: new Date().toISOString()
    },
    {
      status: 'pass' as const,
      additionalMotos: [
        { 
          plate: 'RAD 456B', 
          type: 'ICE Motorcycle', 
          registeredYear: 2019,
          status: 'Active'
        },
        { 
          plate: 'RAD 789C', 
          type: 'E-Motorcycle', 
          registeredYear: 2021,
          status: 'Active'
        }
      ],
      totalMotorcycles: 3,
      message: '2 additional motorcycles found in RURA/RRA records',
      checkedAt: new Date().toISOString()
    }
  ];
  
  const index = applicantName.length % outcomes.length;
  return outcomes[index];
};

export const mockNationalIdCheck = (idNumber: string) => {
  // Simulate validation
  const isValid = idNumber.length === 16;
  
  if (isValid) {
    return {
      status: 'pass' as const,
      valid: true,
      verified: true,
      name: 'Name matches application',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      province: 'Kigali City',
      district: 'Gasabo',
      checkedAt: new Date().toISOString()
    };
  } else {
    return {
      status: 'fail' as const,
      valid: false,
      verified: false,
      reason: 'Invalid ID number format',
      checkedAt: new Date().toISOString()
    };
  }
};

export const mockTaxiLicenseCheck = (licenseNumber: string) => {
  // Simulate license validation
  const isValid = licenseNumber.length >= 6;
  
  if (isValid) {
    return {
      status: 'pass' as const,
      valid: true,
      licenseNumber: licenseNumber,
      issueDate: '2024-01-10',
      expiryDate: '2027-01-10',
      licenseType: 'Motorcycle Taxi',
      province: 'Kigali City',
      licenseStatus: 'Active',
      checkedAt: new Date().toISOString()
    };
  } else {
    return {
      status: 'fail' as const,
      valid: false,
      reason: 'License number not found in RURA database',
      checkedAt: new Date().toISOString()
    };
  }
};

// Simulate loading delay
export const simulateApiCall = <T,>(response: T, delayMs: number = 2000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(response), delayMs);
  });
};