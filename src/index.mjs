import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const mockproducts = [
    {id: 1, name: 'Product 1'},
    {id: 2, name: 'Product 2'},
    {id: 3, name: 'Product 3'},
];

app.get('/', (request, respose) => {
    respose.status(201).send({msg:"Hello World"});
});

app.get('/api/v1/products', (request, respose) => {
    respose.send();
});

app.get('/api/v1/products/:id', (request, respose) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) {
        respose.status(400).send({msg: 'Bad Request; Invalid ID'});
        return;
    };

    const findProduct = mockproducts.find((product) => product.id === parsedId);

    if (!findProduct) {
        respose.status(404).send({msg: 'Not Found; Product not found'});
        return;
    };
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);
