// Comandos personalizados de Cypress para ARIA

// Login programatico para tests que requieren autenticacion
Cypress.Commands.add('loginAs', (rol = 'ciudadano') => {
  const usuarios = {
    ciudadano: { email: 'ciudadano@test.com', contrasena: 'Test1234' },
    entidad:   { email: 'entidad@test.com',   contrasena: 'Test1234' },
    admin:     { email: 'admin@aria.com',      contrasena: 'Admin2026x' },
  }
  const user = usuarios[rol]
  cy.request('POST', 'http://localhost:3000/api/auth/login', user).then(resp => {
    window.localStorage.setItem('token', resp.body.token)
    window.localStorage.setItem('user', JSON.stringify(resp.body.user))
  })
})
