const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const nonVoter = accounts[2];
    const proposal = "Fraises";

    let VotingInstance;
            


    describe("test addVoter", function() {
        beforeEach(async function() {
            VotingInstance = await Voting.new({ from: owner });
        });

        it("should not add a voter if you are not the owner, revert", async () => {
            await expectRevert(
                VotingInstance.addVoter(voter1, { from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        it("should not add a voter if voters registration is not open yet", async () => {
            await VotingInstance.startProposalsRegistering({ from: owner });
            await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), "Voters registration is not open yet");

            await VotingInstance.endProposalsRegistering({ from: owner });
            await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), "Voters registration is not open yet");

            await VotingInstance.startVotingSession({ from: owner });
            await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), "Voters registration is not open yet");

            await VotingInstance.endVotingSession({ from: owner });
            await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), "Voters registration is not open yet");

            await VotingInstance.tallyVotes({ from: owner });
            await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), "Voters registration is not open yet");  
        });
        
        it("should not add a registered voter", async () => {
            await VotingInstance.addVoter(voter1, { from: owner });
            
            let AddedVoter = await VotingInstance.voters[voter1];
            console.log(AddedVoter);
            console.log(VotingInstance.voters[voter1].isRegistered);
            await expectRevert(VotingInstance.voters[voter1].isRegistered,
                "Voter already registered"
                
            );
        });
    
        it("should add a voter to the mapping", async () => {
           await VotingInstance.addVoter(voter1, { from: owner });
            expect(VotingInstance.voters[voter1].isRegistered).to.be.true;
        });

        it("should add voter, get event voter Added", async () => {
            //await VotingInstance.addVoter(voter1, { from: owner });
            //const findEvent = await VotingInstance.addVoter(voter1, { from: owner });
            expectEvent(await VotingInstance.addVoter(voter1, { from: owner }), "VoterRegistered", {voterAddress: voter1});
        });


    });

    describe("test addProposal", function() {
        beforeEach(async function() {
            VotingInstance = await Voting.new({ from: owner });
        });
    
        
        it("should not add a proposal if you are not a voter, revert", async () => {
            await expectRevert(
                VotingInstance.addProposal(proposal, { from: nonVoter }),
                "You are not a voter"
            );
        });
        
        it("should not add a proposal if proposal registering is not open yet", async () => {
            //await VotingInstance.addVoter(voter1, { from: owner })
            await expectRevert(VotingInstance.addProposal(proposal, { from: voter1 }), "The proposal registering is not allowed at this moment");
           
            await VotingInstance.startProposalsRegistering({ from: owner });
            await VotingInstance.endProposalsRegistering({ from: owner });
            await expectRevert(VotingInstance.addProposal(proposal, { from: voter1 }), "The proposal registering is not allowed at this moment");

            await VotingInstance.startProposalsRegistering({ from: owner });
            await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), "Voters registration is not open yet");
            
            await VotingInstance.startVotingSession({ from: owner });
            await expectRevert(VotingInstance.addProposal(proposal, { from: voter1 }), "The proposal registering is not allowed at this moment");

            await VotingInstance.endVotingSession({ from: owner });
            await expectRevert(VotingInstance.addProposal(proposal, { from: voter1 }), "The proposal registering is not allowed at this moment");

            await VotingInstance.tallyVotes({ from: owner });
            await expectRevert(VotingInstance.addProposal(proposal, { from: voter1 }), "The proposal registering is not allowed at this moment");  
        });


        it("should store a proposal in array, get description", async () => {
            await VotingInstance.addVoter(voter1, { from: owner });
            await VotingInstance.startProposalsRegistering({ from: owner });
            await VotingInstance.addProposal(proposal, { from: voter1 });
            const storedData = await VotingInstance.getOneProposal(0);
            expect(storedData.description).to.equal(proposal);

        });
        


        it("should add proposal, get event proposal added", async () => {
            //await VotingInstance.addVoter(voter1, { from: owner });
            //const findEvent = await VotingInstance.addVoter(voter1, { from: owner });
            expectEvent(await VotingInstance.addProposal(proposal, { from: owner }), "ProposalRegistered", {voterAddress: voter1});
        });
    });
});
