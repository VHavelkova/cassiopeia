import { format } from 'date-fns'

export function generateTeamName() {
  return 'Test-' + format(new Date(), 'HH-mm-ss')
}

export function getIndexOfTeam(responseBody, teamName) { 
  for (const i in responseBody) { // loop through teams, returns index
    if (responseBody[i].team === teamName) {
        return i
    }
}
}

export function submit() {
  cy.contains('Click!').click().wait(500)
}