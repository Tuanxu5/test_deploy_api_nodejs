import OrderedCombo from "../models/orderedCombo.js";
import OrderedDish from "../models/orderedDish.js";
import Reservation from "../models/reservation.js";
class OrderedFoodController {
  // Get all
  getAllOrderedFood = async (req, res) => {
    const { reservationId } = req.params;
    if (!reservationId) return res.status(401).json({ message: "Missing reservation Id" });
    try {
      const orderedFoods = await OrderedDish.find({
        reservation_id: reservationId,
      }).populate("dish_id");
      const orderedCombos = await OrderedCombo.find({
        reservation_id: reservationId,
      }).populate({
        path: "setComboProduct_id",
        model: "setComboProduct",
        populate: [
          {
            path: "dishes",
            model: "dish",
          },
          {
            path: "combo_id",
            model: "setCombo",
          },
        ],
      });
      // const detail = await OrderedCombo.find({reservation_id: reservationId})
      // console.log("OrderedCombos:", detail);

      const combos = orderedCombos.map((combo) => {
        const { _id, ...rest } = combo.setComboProduct_id.combo_id;
        return {
          ...rest._doc,
          ...combo._doc,
          dish_id: { ...combo.setComboProduct_id.combo_id._doc },
          type: "combo",
        };
      });
      const foods = orderedFoods.map((food) => ({ ...food.dish_id._doc, ...food._doc, type: "dish" }));
      return res.status(201).json([...combos, ...foods]);
    } catch (error) {
      console.log("Inventories_Error", error);
      return res.status(500).json({ message: "Internal Server Error 4" });
    }
  };
  // add new
  addNewOrderedDish = async (req, res) => {
    const { dish_id, reservation_id } = req.body;
    if (!reservation_id || !dish_id) return res.status(401).json({ message: "All fields are required" });
    try {
      const orderedFood = await OrderedDish.create({
        reservation_id,
        dish_id,
      });

      await Reservation.findByIdAndUpdate(
        reservation_id,
        { $push: { ordered_dishes: orderedFood._doc._id } } // Dùng toán tử $push để thêm vào mảng
      );
      // retrun newest orderedFood with address populate
      const newestOrderedFood = await OrderedDish.findById(orderedFood._id).populate("dish_id");

      return res
        .status(201)
        .json({ orderedFood: { ...newestOrderedFood.dish_id._doc, ...newestOrderedFood._doc, type: "dish" } });
    } catch (error) {
      console.log("Inventories_Error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  // Update ordered dish
  async updateOrderedDish(req, res) {
    const orderedDish_id = req.params.orderedDishId;
    const { quantity } = req.body;

    if (!orderedDish_id) return res.status(401).json({ message: "There is no Id to update ordered dish" });
    if (!quantity) return res.status(401).json({ message: "All data are required" });
    try {
      const updatedDish = await OrderedDish.findByIdAndUpdate(
        { _id: orderedDish_id },
        { quantity: quantity },
        { new: true }
      );

      return res.status(201).json({ message: "Update Successfully!", orderedFood: updatedDish });
    } catch (error) {
      console.log("Inventories_Error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // Delete orderedDish
  async deleteOrderedDish(req, res) {
    const { orderedDishId, reservationId } = req.params;
    if (!orderedDishId) return res.status(401).json({ message: "There is no Id to delete ordered dish" });
    try {
      await OrderedDish.findByIdAndDelete(orderedDishId);
      await Reservation.updateOne(
        { _id: reservationId }, // Tìm document theo ID
        { $pull: { ordered_dishes: orderedDishId } }
      );
      return res.status(201).json({ message: "Successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // Update status orderedDish
  updateOrderedDishesStatus = async (req, res) => {
    try {
      const { selectedRows, statusValue } = req.body; // Lấy dữ liệu từ body

      if (!Array.isArray(selectedRows) || !selectedRows.length) {
        return res.status(400).json({ message: "Invalid selectedRows array" });
      }

      if (!statusValue) {
        return res.status(400).json({ message: "Invalid statusValue" });
      }

      // Cập nhật tất cả OrderedDish có _id nằm trong mảng selectedRows
      const result = await OrderedDish.updateMany(
        { _id: { $in: selectedRows } }, // Điều kiện tìm kiếm
        { $set: { status: statusValue } } // Cập nhật status
      );

      // Trả về kết quả sau khi cập nhật
      return res.status(200).json({
        message: `${result.modifiedCount} dishes updated successfully.`,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error updating dishes", error });
    }
  };
  // delete  orderedDish by array id
  //  deleteOrderedFoodByArrayId = async (req, res) => {
  //   try {
  //     const { selectedRows, statusValue } = req.body; // Lấy dữ liệu từ body

  //     if (!Array.isArray(selectedRows) || !selectedRows.length) {
  //       return res.status(400).json({ message: 'Invalid selectedRows array' });
  //     }

  //     const result = await OrderedDish.deleteMany({
  //       _id: { $in: selectedRows },
  //     });

  //     // Trả về kết quả sau khi cập nhật
  //     return res.status(200).json({
  //       message: `${result.modifiedCount} dishes updated successfully.`,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({ message: 'Error updating dishes', error });
  //   }
  // };
}

export default OrderedFoodController;
