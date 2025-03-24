/**
 * Checks if a user profile has all required fields for contract generation
 * @param {Object} user - User object from Redux state or API
 * @returns {boolean} - True if profile is complete, false otherwise
 */
export const isProfileCompleteForContract = (user) => {
    if (!user) return false;
    
    // Required fields for contract generation
    const requiredFields = [
      'username',
      'address',
      'numeroIdentificacion',
      'tipoIdentificacion'
    ];
    
    // Check if all required fields exist and are not empty
    return requiredFields.every(field => 
      user[field] && user[field].toString().trim() !== ''
    );
  };
  
  /**
   * Gets a list of missing fields from a user profile
   * @param {Object} user - User object from Redux state or API
   * @returns {Array} - List of missing field names
   */
  export const getMissingProfileFields = (user) => {
    if (!user) return [];
    
    const requiredFields = [
      { name: 'username', label: 'Nombre completo' },
      { name: 'address', label: 'Dirección' },
      { name: 'numeroIdentificacion', label: 'Número de identificación' },
      { name: 'tipoIdentificacion', label: 'Tipo de identificación' }
    ];
    
    return requiredFields
      .filter(field => !user[field.name] || user[field.name].toString().trim() === '')
      .map(field => field.label);
  };