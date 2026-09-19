/**
 * Traducciones catalán per GetOutBCN
 */

export const t = {
  // General
  spot: 'lloc',
  spots: 'llocs',
  loading: 'carregant',
  error: 'error',
  retry: 'Tornar a intentar',
  cancel: 'Cancel·lar',
  confirm: 'Confirmar',
  save: 'desar',
  delete: 'eliminar',
  edit: 'editar',
  share: 'compartir',

  // Home Screen
  search: 'CERCAR',
  randomSpot: 'LLOC ALEATORI',
  nearbySpot: 'LLOC PROPER',
  login: 'Iniciar sessió',
  addSpot: '+ Lloc',
  profile: 'Perfil',
  seeAllNearby: 'VEURE TOTS ELS PROPERS',

  // Auth
  email: 'Correu electrònic',
  password: 'Contrasenya',
  confirmPassword: 'Confirmar contrasenya',
  signUp: 'CREAR COMPTE',
  signIn: 'INICIAR SESSIÓ',
  signInLoading: 'INICIANT...',
  signInWithGoogle: 'INICIAR SESSIÓ AMB GOOGLE',
  logout: 'TANCAR SESSIÓ',
  noAccount: 'No tens compte?',
  alreadyHaveAccount: 'Ja tens compte?',
  createAccount: 'Crear compte',
  errorSignIn: 'Error al iniciar sessió',
  errorSignInGoogle: 'Error al iniciar sessió amb Google',
  errorCreatingUser: 'No s\'ha pogut crear l\'usuari',
  errorCreatingAccount: 'Error al crear el compte',

  // Add Spot
  addSpotTitle: 'AFEGIR LLOC',
  name: 'Nom',
  nameRequired: 'Nom *',
  description: 'Descripció',
  descriptionOptional: 'Descripció (opcional)',
  website: 'Lloc web (opcional)',
  category: 'Categoria',
  categoryRequired: 'Categoria *',
  district: 'Districte',
  districtRequired: 'Districte *',
  image: 'Imatge',
  imageRequired: 'Imatge *',
  location: 'Ubicació',
  locationOptional: 'Ubicació (opcional)',
  latitude: 'Latitud',
  latitudeOptional: 'Latitud (opcional)',
  longitude: 'Longitud',
  longitudeOptional: 'Longitud (opcional)',
  address: 'Adreça',
  addressOptional: 'Adreça (opcional)',
  tags: 'Etiquetes',
  tagsOptional: 'Etiquetes (opcional, màx. 3)',
  currentLocation: 'Ubicació actual',
  selectOnMap: 'Seleccionar en mapa',
  selectImage: 'Seleccionar imatge',
  imageSelected: '✓ Imatge seleccionada',
  publish: 'PUBLICAR LLOC',
  publishing: 'PUBLICANT...',
  uploadingImage: 'PUJANT IMATGE...',
  verifyingAuth: 'Verificant autenticació...',
  viewSpot: 'Veure lloc',
  nameRequiredError: 'Has de posar un nom al lloc',
  nameRequiredPlaceholder: 'Nom del lloc',

  // Spot Detail
  spotDetail: 'Detall del lloc',
  notFound: 'Lloc no trobat',
  loadingSpot: 'Carregant lloc...',
  noSpotsInCategory: 'No hi ha llocs en aquesta categoria',
  noSpotsInDistrict: 'No hi ha llocs en aquest districte',
  noSpotsInTag: 'No hi ha llocs amb aquesta etiqueta',
  noSpotsInSearch: 'No hi ha resultats per a aquesta cerca',
  howToGetThere: 'Com arribar-hi',

  // Nearby Spots
  nearbySpots: 'LLOCS PROPERS',
  loadingNearby: 'Carregant llocs propers...',
  noNearbySpots: 'No hi ha llocs propers',

  // Favorites
  favorites: 'Favorits',
  loadingFavorites: 'Carregant favorits...',
  noFavorites: 'No tens favorits encara',
  noFavoritesSubtext: 'Explora llocs i afegeix-los a favorits des del detall',

  // Errors & Validations
  errorLoadingSpot: 'No s\'ha pogut carregar el lloc',
  errorLoadingFavorites: 'No s\'han pogut carregar els favorits',
  errorCreatingSpot: 'No s\'ha pogut crear el lloc',
  errorUploadingImage: 'No s\'ha pogut pujar la imatge',
  errorInvalidCoordinates: 'Les coordenades no són vàlides. Han de ser números.',
  errorOpenMaps: 'No s\'ha pogut obrir l\'aplicació de mapes',
  categoryRequiredError: 'Has de seleccionar una categoria',
  districtRequiredError: 'Has de seleccionar un districte',
  imageRequiredError: 'Has de seleccionar una imatge',
  invalidEmail: 'Correu electrònic no vàlid',
  passwordTooShort: 'La contrasenya ha de tenir almenys 6 caràcters',
  passwordsDoNotMatch: 'Les contrasenyes no coincideixen',
  errorClosingSession: 'Error al tancar sessió',

  // Success messages
  spotCreated: 'Lloc creat correctament',
  locationObtained: 'Ubicació obtinguda',
  locationSaved: 'Coordenades desades als camps corresponents',
  locationSelected: 'Ubicació seleccionada',
  locationCoordinatesSaved: 'Les coordenades s\'han desat als camps corresponents',

  // Map
  selectLocationOnMap: 'SELECCIONA UBICACIÓ',
  tapMapToSelect: 'Toca en el mapa per triar les coordenades',
  selectedLocation: 'Ubicació seleccionada',

  // Permissions
  permissionDenied: 'Permís denegat',
  locationPermissionDenied: 'No es pot obtenir la ubicació sense permisos. Els camps de latitud i longitud quedaran buits.',
  galleryPermissionDenied: 'Necessitem accés a la teva galeria per seleccionar una imatge',

  // Placeholders
  spotName: 'Nom del lloc',
  spotDescription: 'Descriu el lloc...',
  selectCategory: 'Selecciona una categoria',
  selectDistrict: 'Selecciona un districte',
  addTag: 'Afegir etiqueta...',
  streetAndNumber: 'Carrer i número',

  // Tags
  maxTagsReached: 'Límit assolit',
  maxTagsMessage: 'Pots afegir màxim 3 etiquetes',
  duplicateTag: 'Etiqueta duplicada',
  duplicateTagMessage: 'Aquesta etiqueta ja existeix',

  // Share
  shareSpot: 'Mira aquest lloc a GetOutBCN',
  loginToSave: 'Has d\'iniciar sessió per guardar llocs',

  // Profile
  profileTitle: 'PERFIL',
  emailLabel: 'EMAIL',
  userIdLabel: 'ID D\'USUARI',

  // No district
  noDistrict: 'Sense districte',

  // Storage errors
  errorAuthToken: 'No s\'ha pogut obtenir el token d\'autenticació',
  errorSignedUrl: 'Error al obtenir URL firmada',
  errorDownloadImage: 'Error al descarregar imatge',
  errorUploadImage: 'Error al pujar imatge',
  errorUploadAvatar: 'Error al pujar avatar',
  errorDeleteImage: 'Error al eliminar imatge',

  // Social auth errors
  errorAuthUrl: 'No s\'ha pogut obtenir la URL d\'autenticació',
  errorAuthCancelled: 'Autenticació cancel·lada o fallida',

  // Image picker errors
  errorSelectImage: 'No s\'ha pogut seleccionar la imatge',
  errorGetLocation: 'No s\'ha pogut obtenir la ubicació. Pots introduir-la manualment o seleccionar-la al mapa.',

  // Misc
  locationNotAvailable: 'Ubicació no disponible',
  openApp: 'Obre App.tsx per començar a treballar amb la teva app!',
};
