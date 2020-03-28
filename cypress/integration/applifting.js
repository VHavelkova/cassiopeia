import random from 'lodash/random'
import { generateTeamName, getIndexOfTeam, requestKlik, submit } from '../support/appliftingFunctions'

const teamName = generateTeamName() // 'Test' + date
const teamNameRequest = generateTeamName() + 'req' // different name for test with requests
const count = random(1, 5)
const count2 = random(1, 5)
const urlKlik = 'https://klikuj.herokuapp.com/api/v1/klik'
const urlLeaderboard = 'https://klikuj.herokuapp.com/api/v1/leaderboard'

describe('Test scenario for app stfu and click', function() {

  beforeEach('hook with routes', function() {
    cy.server()
    cy.route('GET', urlLeaderboard).as('leaderboard')
    cy.route('POST', urlKlik).as('klik')
  })

  it('checks main functs', () => {
    cy.visit('http://test-stfu-applifting.herokuapp.com')
    
    // save xhr requests
    cy.wait('@leaderboard')

    // checks that main buttons exist
    cy.get('input').should('exist') 
    cy.contains('Click!').should('exist')

    // tests simple input:

    // nothing
    submit() // clicks on button 'Click' and waits 0,5s
    //cy.contains('Vyplňte prosím toto pole').should('exist')

    // blank space    
    cy.get('input').type(' ')
    submit()
    cy.contains('Team name contains forbidden characters').should('exist')

    // symbols
    cy.get('input').clear().type('?')
    submit()
    cy.contains('Team name contains forbidden characters').should('exist')

    // teamname
    cy.get('input').clear().type(teamName)
    submit()
    cy.contains('Team name contains forbidden characters').should('not.exist')

    // click x times
    for (var i = 0; i < count - 1; i++) { // - 1, because one click was already submitted in step before
      submit()
    }
    
    // check correct count via click api
    cy.get('@klik').then($klik => { // last click post request
      expect($klik.responseBody.your_clicks).to.equal(count)
      expect($klik.responseBody.team_clicks).to.equal(count)
    })

    // check correct count and teamname via leaderboard api
    cy.get('@leaderboard').then($leaderboard => { 
      var index = getIndexOfTeam($leaderboard.responseBody, teamName)
      expect($leaderboard.responseBody[index].clicks).to.equal(count)
      expect($leaderboard.responseBody[index].team).to.equal(teamName)
    })
  })
  
  it('tests functionality from new window', function() {
    cy.visit('http://test-stfu-applifting.herokuapp.com/' + teamName)

    // click x times
    for (var i = 0; i < count2; i++) {
      submit()
    }
    
    // check correct count via click api
    cy.get('@klik').then($klik => { // last click post request
      expect($klik.responseBody.your_clicks).to.equal(count2)
      expect($klik.responseBody.team_clicks).to.equal(count + count2)
    })

    // check correct count and teamname via leaderboard api
    cy.get('@leaderboard').then($leaderboard => { 
      var index = getIndexOfTeam($leaderboard.responseBody, teamName)
      expect($leaderboard.responseBody[index].clicks).to.equal(count + count2)
      expect($leaderboard.responseBody[index].team).to.equal(teamName)
    })
  })

  it('tests app via requests', () => {

    cy.request('POST', urlKlik, {'team': teamNameRequest, 'session': teamNameRequest})
    // session string same as teamNameRequest, because it is unique for each run too
      .then((response) => {
          expect(response.body.your_clicks).to.equal(1)
          expect(response.body.team_clicks).to.equal(1)
        })

    cy.request('GET', urlLeaderboard)
      .then((response) => {
        var index = getIndexOfTeam(response.body, teamNameRequest)
        expect(response.body[index].team).to.equal(teamNameRequest)
        expect(response.body[index].clicks).to.equal(1)
      })    
  })
})