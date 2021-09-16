from flask import request, jsonify
from flask_restful import Resource
from flask_restful import reqparse

from server.api import api
from server import app
from server.api.resources.utils import get_model, user_type, ModelId
from data import AccessGroup, User, db_session


@api.resource('/access_group/<int:ag_id>')
class AccessGroupResource(Resource):
    def get(self, ag_id):
        return jsonify(dict(access_group=get_model(AccessGroup, ag_id).to_dict(), success=True))


def _parse_member(*args, **kwargs) -> User:
    parser = reqparse.RequestParser()
    parser.add_argument('member', type=user_type(), required=True)
    parsed = parser.parse_args(*args, **kwargs)
    return parsed['member']


@app.route('/access_group/<int:ag_id>/add', methods=['PUT'])
def ag_add_member(ag_id: int):
    ag: AccessGroup = get_model(AccessGroup, ag_id)
    member = _parse_member()
    ag.members.append(member)
    db_session.commit()
    return jsonify({'success': True, 'member': member.to_dict()})


@app.route('/access_group/<int:ag_id>/remove', methods=['DELETE'])
def ag_remove_member(ag_id: int):
    ag: AccessGroup = get_model(AccessGroup, ag_id)
    parser = reqparse.RequestParser()
    parser.add_argument('member_id', type=ModelId(User), dest='member')
    args = parser.parse_args()
    member = args['member']
    if member in ag.members:
        ag.members.remove(member)
        db_session.commit()
    return jsonify({'success': True})
