describe('ARIA Frontend - Pruebas E2E', () => {

  it('Carga la pagina de login correctamente', () => {
    cy.visit('/login')
    cy.contains('ARIA').should('be.visible')
    cy.contains('Iniciar sesión').should('be.visible')
  })

  it('Muestra errores de validacion en login', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').click()
    cy.contains('El correo es obligatorio').should('be.visible')
  })

  it('Navega a la pagina de registro', () => {
    cy.visit('/login')
    cy.contains('Regístrate aquí').click()
    cy.url().should('include', '/register')
    cy.contains('Crear cuenta').should('be.visible')
  })

  it('Muestra el selector de rol en registro', () => {
    cy.visit('/register')
    cy.contains('Ciudadano').should('be.visible')
    cy.contains('Entidad').should('be.visible')
  })

  it('Muestra campos extra al seleccionar Entidad', () => {
    cy.visit('/register')
    cy.contains('Entidad').click()
    cy.contains('NIT').should('be.visible')
    cy.contains('Nombre de la organización').should('be.visible')
  })

  it('Navega a recuperar contrasena', () => {
    cy.visit('/login')
    cy.contains('¿Olvidaste tu contraseña?').click()
    cy.url().should('include', '/recuperar')
    cy.contains('Recuperar contraseña').should('be.visible')
  })

  it('La pagina de verificacion OTP tiene 6 inputs', () => {
    cy.visit('/verificar-codigo', {
      state: { email: 'test@test.com' }
    })
    cy.get('input[maxlength="1"]').should('have.length', 6)
  })

})
