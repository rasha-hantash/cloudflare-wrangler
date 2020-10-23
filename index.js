const Router = require('./router')

const url = "https://static-links-page.signalnerve.workers.dev"

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

// Deploy a JSON API
function handler() {
    const links = [
        {"name": "Santorini", "url": "https://www.tripadvisor.com/Tourism-g189433-Santorini_Cyclades_South_Aegean-Vacations.html"},
        {"name": "Project Galileo", "url": "https://www.cloudflare.com/galileo/"},
        {"name": "Athenian Project", "url": "https://www.cloudflare.com/athenian/"}
    ] 
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify( links )
    return new Response(body, init)
}

// 1. Retrieve static HTML page
async function fetchHTML(){
    const init = {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      }
    
    const response = await fetch(url, init)
    const results = await gatherResponse(response)

    // 2. Get the links from your previously deployed JSON response
    const newLinks = await handler()
    const linksresult = await gatherResponse(newLinks)
    let newRes = new Response(results, init)

    
    // 4. Return the transformed HTML page from the Worker
    return new HTMLRewriter().on("*", new LinksTransformer(linksresult)).transform(newRes)
      
}

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
    const { headers } = response
    const contentType = headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      return await response.json()
    }
    else if (contentType.includes("text/html")) {
      return await response.text()
    }
    else {
      return await response.text()
    }
  }

// Transforms static html using HTMLReWriter
class LinksTransformer {
    constructor(links) {
      this.links = links
    }
    
    async element(element) {
        console.log("tagenane ", element.tagName)
        // Removing display:none style
        if (element.getAttribute('id') === 'profile') {
            element.setAttribute('style', '')

        } 

        // Adding my user id to name
        if (element.getAttribute('id')=== 'name'){
            element.setInnerContent('rasha-hantash')
        }

        // Adding my avatar to te page 
        if (element.getAttribute('id')=== 'avatar'){
            element.setAttribute('src',  'https://media-exp1.licdn.com/dms/image/C4E03AQFQD3AlAU0RcA/profile-displayphoto-shrink_400_400/0?e=1608768000&v=beta&t=1qtNvwQ6LpF2fwZIZZCP8NimyyRXGBkNxlTGJKrnqgE')
        }
        
        // Render links from $URL onto the page
        // 3. Use HTMLRewriter to add these links to the static HTML page
        if (element.getAttribute('id') === 'links'){
            for (const [key, value] of Object.entries(this.links)) {
                element.append(`<a href="${value['url']}">${value['name']}</a>`, {html: true})
            }
        }

        // Extra credit: Provide social links
        if (element.getAttribute('id') === 'social'){
            element.setAttribute('style', '')

            
            element.append(`
            <a href="https://www.linkedin.com/in/rasha-hantash/">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn icon</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            `, {html:true})

            element.append(`
            <a href="https://github.com/rasha-hantash">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub icon</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            `, {html:true})

          
        }

        // Extra credit: Modify the body
        if (element.tagName === 'body'){
            element.setAttribute('class', 'bg-red-200')
        }

        // Extra credit: Modify the title
        if (element.tagName === 'title'){
            element.setInnerContent('Rasha Hantash')
        }
  
      
    }
}

// Handle routing request to / and /links
async function handleRequest(request) {
    const r = new Router()
    r.get('/links', ()=> handler())

    r.get('/', () => fetchHTML())
    const resp = await r.route(request)
    return resp
}
