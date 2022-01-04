module.exports = {
    remainingDays(job) {
      // cálculo do tempo restante
      const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed()
    
      const createdDate = new Date(job.created_at)
      const dueDay = createdDate.getDate() + Number(remainingDays)
      const dueDateInMs = createdDate.setDate(dueDay)
    
      const timeDiffInMs = dueDateInMs - Date.now()
    
      const dayInMs = 1000 * 60 * 60 * 24
    
      const dayDiff = Math.ceil(timeDiffInMs / dayInMs)
    
      // dias restantes
      return dayDiff
    },

    calculateBudget(job, valueHour) {
      return valueHour * job["total-hours"]
    }
}