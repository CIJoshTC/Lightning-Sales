const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');




router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    
    
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagData = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagData);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      
      const existingTagIds = productTags.map(({ tag_id }) => tag_id);

     
      const tagIdsToAdd = req.body.tagIds.filter((tag_id) => !existingTagIds.includes(tag_id));
      const tagIdsToRemove = existingTagIds.filter((tag_id) => !req.body.tagIds.includes(tag_id));

      
      const productTagDataToAdd = tagIdsToAdd.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagDataToAdd);

      
      await ProductTag.destroy({
        where: {
          id: tagIdsToRemove,
        },
      });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(deletedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});



module.exports = router;
