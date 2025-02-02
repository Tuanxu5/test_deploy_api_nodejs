import Table from "../models/table.js"
class TableController {
  // Get all tables
  async getAlltables(req, res) {
    try {
      const tables = await Table.find({}).sort({ order: 1 })
      const orderNumberTableMax = await Table.findOne().sort({ order: -1 })
      let numberOfTable
      // get currently largest order field to create new table
      orderNumberTableMax
        ? (numberOfTable = orderNumberTableMax.order + 1)
        : (numberOfTable = 1)

      return res.status(201).json({ tables, numberOfTable })
    } catch (error) {
      return res
        .status(501)
        .json({ message: "Something went wrong with get all Table" })
    }
  }
  // Get detail table
  async getDetailTable(req, res) {
    const { id } = req.params
  if (!id)
    return res.status(401).json(
      { message: "There is no Id to get detail table" },
    )
  try {
    const newTable = (await Table.findById(id)) 
    if(!newTable) res.status(401).json({ message: "Can't get table by id" })
    return res.status(201).json({ table: newTable })
  } catch (error) {
    console.log("Inventories_Error", error)
    return res.status(500).json(
      { message: "Internal Server Error" },
    )
  }
  }
// Add new table
  addNewTable = async (req, res) => {
    try {
      const { location_id, order } = req.body
      console.log(location_id, order)

      if (!location_id || !order)
        return res
          .status(401)
          .json({ message: "All data are required" }, { status: 401 })
      const newTable = await Table.create({
        order: order,
        location_id: location_id,
      })
      return res.status(201).json({ newTable, message: "Succussfully!" })
    } catch (error) {
      console.log("Inventories_Error", error)
      return res.status(501).json({ message: "Internal Server Error" })
    }
  }

  // Update order table
  async updateFornewTable(item, index) {
    await Table.findByIdAndUpdate(
      { _id: item._id },
      { order: index, location_id: item.location_id }
    )
  }
  
  updateOrderTable = async (req, res) => {
    const { newArray } = req.body
    const tableArray = newArray
    if (!newArray)
      return res
        .status(401)
        .json({ message: "Array for update is currently empty" })

    try {
      tableArray.forEach((item, index) => {
        this.updateFornewTable(item, index)
      })
      return res.status(201).json({ message: "Successfully" })
    } catch (error) {
      console.log(error)
    }
  }
// update information tables
  async updateTableInformation(req, res) {
    const { id } = req.params
    const { number_of_seats, name } = req.body
    if (!id) return res.status(401).json({ message: "There's no id" })
    if (!number_of_seats || !name)
      return res
        .status(401)
        .json({ message: "There is no body to update table" })

    try {
      const newTable = await Table.findByIdAndUpdate(
        { _id: id },
        { number_of_seats: number_of_seats, name: name }
      )
      return res.status(201).json({ message: "Update Successfully!", newTable })
    } catch (error) {
      console.log("Inventories_Error", error)
      return res.status(501).json({ message: "Internal Server Error!" })
    }
  }
// delete tables
  async deleteTable(req, res) {
    const { id } = req.params
    if (!id)
      return res
        .status(401)
        .json({ message: "There is no Id to delete detail table!" })

    try {
      await Table.findByIdAndDelete({ _id: id })

      return res.status(201).json({ message: "Delete Successfully!" })
    } catch (error) {
      console.log("Inventories_Error", error)

      return res.status(501).json({ message: "Internal Server Error" })
    }
  }
}

export default TableController
