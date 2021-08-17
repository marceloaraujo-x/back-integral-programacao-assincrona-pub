const fs = require('fs/promises');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/enderecos/:cep', async (req, res) => {
    const cep = req.params.cep;
    const enderecos = JSON.parse(await fs.readFile('enderecos.json'));
    const cepComTraco = `${cep.substr(0, 5)}-${cep.substr(5, 3)}`;
    const enderecoEncontrado = enderecos.find(endereco => endereco.cep === cepComTraco);

    if (enderecoEncontrado) {
        console.log('Encontrou no arquivo!');
        return res.json(enderecoEncontrado);
    }

    console.log('Vou pro ViaCep!');
    const { data: enderecoEncontradoViaCep } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (enderecoEncontradoViaCep) {
        if (!enderecoEncontradoViaCep.erro) {
            enderecos.push(enderecoEncontradoViaCep);

            await fs.writeFile('enderecos.json', JSON.stringify(enderecos, null, 2));
        }
        else {
            return res.json({ mensagem: 'Cep não encontrado nem no ViaCep.' });
        }
    }

    res.json(enderecoEncontradoViaCep);
});

app.get('/enderecos/:uf/:cidade/:logradouro', async (req, res) => {
    const { uf, cidade, logradouro } = req.params;
    const enderecos = JSON.parse(await fs.readFile('enderecos.json'));
    const enderecoEncontrado = enderecos.find(e => e.logradouro.includes(logradouro));

    if (enderecoEncontrado) {
        console.log('Encontrou no arquivo!');
        return res.json(enderecoEncontrado);
    }

    console.log('Vou pro ViaCep!');
    let { data: enderecoEncontradoViaCep } = await axios.get(`https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`);

    if (Array.isArray(enderecoEncontradoViaCep)) {
        enderecoEncontradoViaCep = enderecoEncontradoViaCep[0];
    }

    if (enderecoEncontradoViaCep) {
        if (!enderecoEncontradoViaCep.erro) {
            enderecos.push(enderecoEncontradoViaCep);

            await fs.writeFile('enderecos.json', JSON.stringify(enderecos, null, 2));
        }
        else {
            return res.json({ mensagem: 'Cep não encontrado nem no ViaCep.' });
        }
    }

    res.json(enderecoEncontradoViaCep);
});


app.listen(8000);
