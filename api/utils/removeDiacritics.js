function removeDiacritics(str) {
    return str
      .normalize('NFD')                     // descompone letras con tildes
      .replace(/[\u0300-\u036f]/g, '');    // quita los caracteres diacríticos
  }
  