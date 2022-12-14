import React, { useState, useEffect } from "react";
import fetch from './api/dataService';
import ReactTable from 'react-table';
import "./App.css";
import _ from 'lodash';

const calculateResults = data => {

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = data.map(transaction=> {
    let points = 0;
    if (transaction.amount > 100) {    
      points = 2*(transaction.amount-100)+50;
    } else if (transaction.amount > 50 && transaction.amount<=100) {
      points = transaction.amount - 50;      
    }
    else{
      points = 0;
    }
    const month = new Date(transaction.transactionDate).getMonth();
    return {...transaction, points, month};
  });
               
  let customer = {};
  let totalPoints = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let {customerId, name, month, points} = pointsPerTransaction;   
    if (!customer[customerId]) {
      customer[customerId] = [];      
    }    
    if (!totalPoints[customerId]) {
      totalPoints[name] = 0;
    }
    totalPoints[name] += points;
    if (customer[customerId][month]) {
      customer[customerId][month].points += points;
      customer[customerId][month].monthNumber = month;
      customer[customerId][month].numTransactions++;      
    }
    else { 
      customer[customerId][month] = {
        customerId,
        name,
        monthNumber:month,
        month: months[month],
        numTransactions: 1,        
        points
      }
    }    
  });
  let total = [];
  for (var custKey in customer) {    
    customer[custKey].forEach(row=> {
      total.push(row);
    });    
  }
 
  let totalByCustomer = [];
  for (custKey in totalPoints) {    
    totalByCustomer.push({
      name: custKey,
      points: totalPoints[custKey]
    });    
  }
  return {
    summaryByCustomer: total,
    pointsPerTransaction,
    totalPoints:totalByCustomer
  };
}

const App = () => {
  const [transactionData, setTransactionData] = useState(null);
  
  const columns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Month',
      accessor: 'month'
    },
    {
      Header: "# of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header:'Reward Points',
      accessor: 'points'
    }
  ];
  const totalsByColumns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Points',
      accessor: 'points'
    }
  ]

  useEffect(() => { 
    fetch().then((data)=> {             
      const results = calculateResults(data);      
      setTransactionData(results);
    });
  },[]);

  const getIndividualTransactions = row => {
    let byCustMonth = _.filter(transactionData.pointsPerTransaction, (tRow)=>{    
      return row.original.custid === tRow.custid && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  if (transactionData == null) {
    return <div>Loading...</div>;   
  }

  return transactionData == null ?
    <div>Loading...</div> 
      :    
    <div>      
      
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals by Customer Months</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.summaryByCustomer}
              defaultPageSize={5}
              columns={columns}
              SubComponent={row => {
                return (
                  <div>
                    
                      {getIndividualTransactions(row).map(item=>{
                        return <div className="container">
                          <div className="row">
                            <div className="col-8">
                              <strong>Transaction Date:</strong> {item.transactionDate} - <strong>$</strong>{item.amount} - <strong>Points: </strong>{item.points}
                            </div>
                          </div>
                        </div>
                      })}                                    

                  </div>
                )
              }}
              />             
            </div>
          </div>
        </div>
        
        <div className="container">    
          <div className="row">
            <div className="col-10">
              <h2>Points Rewards System Totals By Customer</h2>
            </div>
          </div>      
          <div className="row">
            <div className="col-8">
              <ReactTable
                data={transactionData.totalPointsByCustomer}
                columns={totalsByColumns}
                defaultPageSize={5}                
              />
            </div>
          </div>
        </div>      
    </div>
  ;
}

export default App;
