const Job = require('../model/Job')
const Profile = require('../model/Profile')
const JobUtils = require('../utils/JobUtils')

module.exports = {
    async index(req, res) {
        const jobs = await Job.get()
        const profile = await Profile.get()

        let statusCount = {
            progress: 0,
            done: 0,
            total: jobs.length
        }

        let jobTotalHours = 0;

        const updateJobs = jobs.map((job) => {
          // ajustes no job
          const remaining = JobUtils.remainingDays(job)
          const status = remaining <= 0 ? 'done' : 'progress'

          // somando quantidade de progress ou done em statusCount
          statusCount[status]++;

          jobTotalHours = status == 'progress' ? jobTotalHours + Number(job["daily-hours"]) : jobTotalHours;
          
          return {
            ...job,
            remaining,
            status,
            budget: JobUtils.calculateBudget(job, profile["value-hour"])
          }
        })

        // quantidade de horas livres
        // horas trabalhadas no dia MENOS horas de cada job em progress
        const freeHours = profile["hours-per-day"] - jobTotalHours
      
        return res.render("index", { profile, jobs: updateJobs, statusCount, freeHours })
    }
}