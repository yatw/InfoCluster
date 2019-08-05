import React, { Component } from 'react'
import PropTypes from 'prop-types';

export class LinkItem extends Component {

    getStarClass = () =>{
        
        return (this.props.link.star)?"fas fa-star fa-clickable" : "far fa-star fa-clickable";
    }

    getReadClass = () =>{
        
        return (this.props.link.completed)?"fas fa-check-square fa-clickable" : "far fa-check-square fa-clickable";
    }

    
    render() {
        const {linkId, title, detail, star} = this.props.link;

        return (
            <tr>
                {/*linkId */}
                <td id="linkId">{this.props.link.linkId}</td>

                {/*Star */}
                <td><i className={this.getStarClass()} style={{fontSize:'20px', color:'#FFD700'}} onClick={this.props.starToggle.bind(this, linkId, star)}></i></td>
              
                {/*Title */}
                <td><a href= {this.props.link.url} target="_blank">{title}</a></td>

                {/*Description */}
                <td>{detail}</td>

                {/*createdDate */}
                <td>{this.props.link.createdDate}</td>

                {/*Read */}
                <td><i className={this.getReadClass()} style={{fontSize:'30px', color:'#02cf32'}}></i></td>

                {/*Edit */}
                <td><i className="fas fa-edit fa-clickable" style={{fontSize:'30px', color:'#ff9933'}}></i></td>
            </tr>
        );
    }
}

// PropTypes
LinkItem.propTypes = {
    link: PropTypes.object.isRequired
}

  
export default LinkItem
