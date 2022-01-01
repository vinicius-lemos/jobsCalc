const express = require("express")
const routes = express.Router() // "Router()" esse método retorna um objeto para criar rotas

const views = __dirname + "/views/"

const Profile = {
  data: {
    name: "Duckling Gordo",
    avatar: "https://i.pinimg.com/originals/b6/bc/91/b6bc9124fcc9efb5bbaa6d4c07a125a3.jpg",
    "monthly-budget": 3000,
    "days-per-week": 5,
    "hours-per-day": 5,
    "vacation-per-year": 4,
    "value-hour": 75
  },

  controllers: {
    index(req, res) {
      return res.render(views + "profile", { profile: Profile.data })
    },

    update(req, res) {
      // pegar os dados pelo req.body
      const data = req.body

      // definir quantas semanas tem um ano: 52
      const weeksPerYear = 52

      // remover as semanas de férias do ano, para pegar quantas semanas tem em 1 mês
      const weeksPerMonth = (weeksPerYear - data["vacation-per-year"]) / 12

      // total de horas trabalhas por semana
      const weekTotalHours = data["hours-per-day"] * data["days-per-week"]

      // total de horas trabalhadas no mês
      const monthlyTotalHours = weekTotalHours * weeksPerMonth

      // valor da hora
      const valueHour = data["monthly-budget"] / monthlyTotalHours

      Profile.data = {
        ...Profile.data,
        ...req.body,
        "value-hour": valueHour
      }

      return res.redirect('/profile')
    }
  }
}

const Job = {
  data: [
    {
      id: 1,
      name: "Pizzaria Guloso",
      "daily-hours": 2,
      "total-hours": 60,
      created_at: Date.now()
    },
    {
      id: 2,
      name: "OneTwo Project",
      "daily-hours": 3,
      "total-hours": 47,
      created_at: Date.now()
    }
  ],

  controllers: {
    index(req, res) {
        const updateJobs = Job.data.map((job) => {
          // ajustes no job
          const remaining = Job.services.remainingDays(job)
          const status = remaining <= 0 ? 'done' : 'progress'
          
          return {
            ...job,
            remaining,
            status,
            budget: Job.services.calculateBudget(job, Profile.data["value-hour"])
          }
        })
      
        return res.render(views + "index", { profile: Profile.data, jobs: updateJobs })
    },

    create(req, res) {
      return res.render(views + "job")
    },

    save(req, res) {
      const lastId = Job.data[Job.data.length - 1]?.id || 0;

      // req.body retorna um objeto com os dados do form
      Job.data.push({
        id: lastId + 1,
        name: req.body.name,
        "daily-hours": req.body["daily-hours"],
        "total-hours": req.body["total-hours"],
        created_at: Date.now() // atribuindo data atual
      })

      return res.redirect('/') // redireciona para a rota '/'
    },

    show(req, res) {
      const jobId = req.params.id

      const job = Job.data.find(job => Number(job.id) === Number(jobId)) // find busca um valor no array e retorna o elemento do array que possui esse valor

      if(!job) {
        return res.send('Job not found!')
      }

      job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"])

      return res.render(views + "job-edit", { job })
    },

    update(req, res) {
      const jobId = req.params.id

      const job = Job.data.find(job => Number(job.id) === Number(jobId))

      if(!job) {
        return res.send('Job not found!')
      }

      const updatedJob = {
        ...job,
        name: req.body.name,
        "total-hours": req.body["total-hours"],
        "daily-hours": req.body["daily-hours"]
      }

      Job.data = Job.data.map(job => { // map retorna um novo array
        if (Number(job.id) === Number(jobId)) {
          job = updatedJob
        }

        return job
      })

      return res.redirect('/job/' + jobId)
    },

    delete(req, res) {
      const jobId = req.params.id

      Job.data = Job.data.filter(job => Number(job.id) != Number(jobId)) // filter retorna um novo array somente com os elementos verdadeiros da condição

      return res.redirect('/')
    }
  },

  services: {
    remainingDays(job) {
      // cálculo do tempo restante
      const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed()
    
      const createdDate = new Date(job.created_at)
      const dueDay = createdDate.getDate() + Number(remainingDays)
      const dueDateInMs = createdDate.setDate(dueDay)
    
      const timeDiffInMs = dueDateInMs - Date.now()
    
      const dayInMs = 1000 * 60 * 60 * 24
    
      const dayDiff = Math.floor(timeDiffInMs / dayInMs)
    
      // dias restantes
      return dayDiff
    },

    calculateBudget(job, valueHour) {
      return valueHour * job["total-hours"]
    }
  }
}

// request, response
routes.get('/', Job.controllers.index)
routes.get('/job', Job.controllers.create)
routes.post('/job', Job.controllers.save)// post guarda dados do form no req
routes.get('/job/:id', Job.controllers.show)
routes.post('/job/:id', Job.controllers.update)
routes.post('/job/delete/:id', Job.controllers.delete)
routes.get('/profile', Profile.controllers.index)
routes.post('/profile', Profile.controllers.update)

module.exports = routes;