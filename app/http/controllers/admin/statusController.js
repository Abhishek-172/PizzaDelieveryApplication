const Order = require('../../../models/order');

function statusController()
{
    return {
      update(req, res)
      {
        Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }, (err, data)=>
        {
            if(err)
            {
                return res.redirect('/admin/orders');                
            }
            //Emit Event
            const eventEmitter = req.app.get('eventEmitter');
            //Here Below we have emitted the event named orderUpdated and passed some data 
            eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
            return res.redirect('/admin/orders');
        })
      }  
    }
}

module.exports = statusController;