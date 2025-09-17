const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// "Base de datos" para guardar ordenes
const orders = [];

function generateOrderId()
{
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let orderId = "";

    for (let i = 0; i < 4; i++)
    {
        orderId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return orderId;
}

app.post("/webhook", (req, res) =>
{
    const intent = req.body.queryResult.intent.displayName;

    if (intent === "Order confirmation")
    {
        //Se toman los parámetros pasados al chatbot
        const parameters = req.body.queryResult.parameters;
        const pizzaType = parameters.pizzaType;
        const pizzaSize = parameters.pizzaSize || "Mediana";
        const pizzaToppings = parameters.topping || [];

        //Se crea el objeto order y se guarda en la "base de datos"
        const orderId = generateOrderId();
        const order = {
            id: orderId,
            type: pizzaType,
            size: pizzaSize,
            toppings: pizzaToppings,
        };
        orders.push(order);

        const responseText = `Tu pedido de una pizza ${pizzaSize} ${pizzaType} ${pizzaToppings.length > 0 ? `con ${pizzaToppings.join(", ")}` : "sin ingredientes extra"} ha sido confirmado. Tu número de pedido es ${orderId}.`;

        return res.json({ fulfillmentText: responseText });
    }

    if (intent === "Check order")
    {
        const orderId = String(req.body.queryResult.parameters.orderID).toUpperCase();

        //Busca la orden en la "base de datos"
        const order = orders.find((order) => order.id === orderId);

        if (order)
        {
            const responseText = `Aquí están los detalles del pedido con ID ${orderId}: pizza ${order.size} ${order.type} ${order.toppings.length > 0 ? `con ${order.toppings.join(", ")}` : "sin ingredientes extra"}.`;

            return res.json({ fulfillmentText: responseText });
        } 
        else
        {
            const responseText = `Lo siento, no pude encontrar ningún pedido con el ID ${orderId}. Por favor, verifica el ID e intenta de nuevo.`;
            return res.json({ fulfillmentText: responseText });
        }

    }

    return res.json({ fulfillmentText: "Lo siento, no pude procesar lo que quisiste decir" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
{
    console.log(`El servidor se está ejecutando en el puerto: ${PORT}`);
});
